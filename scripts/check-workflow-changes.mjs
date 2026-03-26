// Pre-commit workflow guard that inspects staged files and enforces required companion docs.
import { execFileSync } from 'node:child_process';

import {
  getWorkflowGuardReport,
  hasMeaningfulChangedLines,
  isRuntimePath,
} from './workflow-lib.mjs';

// The guard inspects staged files only, because it is meant to run in pre-commit contexts.
function getStagedFiles() {
  const output = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    encoding: 'utf8',
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getStagedPatch(filePath) {
  return execFileSync('git', ['diff', '--cached', '--unified=0', '--', filePath], {
    encoding: 'utf8',
  });
}

function hasMeaningfulRuntimeChanges(stagedFiles) {
  return stagedFiles
    .filter((filePath) => isRuntimePath(filePath))
    .some((filePath) => hasMeaningfulChangedLines(filePath, getStagedPatch(filePath)));
}

function main() {
  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    console.log('workflow:guard skipped because nothing is staged.');
    return;
  }

  const report = getWorkflowGuardReport(stagedFiles, {
    hasMeaningfulRuntimeChanges: hasMeaningfulRuntimeChanges(stagedFiles),
  });

  // Warnings keep the workflow nudged without blocking small, intentional exceptions.
  for (const warning of report.warnings) {
    console.warn(`workflow:guard warning: ${warning}`);
  }

  if (report.errors.length > 0) {
    console.error('workflow:guard failed:');
    for (const error of report.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log('workflow:guard passed.');
}

try {
  main();
} catch (error) {
  // Git can be unavailable in extracted folders, so the failure message stays explicit.
  console.error(`workflow:guard failed to inspect git state: ${error.message}`);
  process.exit(1);
}
