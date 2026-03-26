import { execFileSync } from 'node:child_process';

import { getWorkflowGuardReport } from './workflow-lib.mjs';

function getStagedFiles() {
  const output = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    encoding: 'utf8',
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function main() {
  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    console.log('workflow:guard skipped because nothing is staged.');
    return;
  }

  const report = getWorkflowGuardReport(stagedFiles);

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
  console.error(`workflow:guard failed to inspect git state: ${error.message}`);
  process.exit(1);
}
