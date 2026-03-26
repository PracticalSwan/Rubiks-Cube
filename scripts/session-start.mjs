import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildArtifactPaths, slugifyTopic } from './workflow-lib.mjs';

const templateMap = {
  plan: 'docs/templates/implementation-plan-template.md',
  handoff: 'docs/templates/handoff-template.md',
  spec: 'docs/templates/spec-template.md',
};

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirectories(rootDir) {
  await Promise.all(
    ['docs/plans', 'docs/specs', 'docs/handoffs', 'docs/templates'].map((relativeDir) =>
      mkdir(path.join(rootDir, relativeDir), { recursive: true }),
    ),
  );
}

function fillTemplate(templateText, topic, topicSlug, date) {
  return templateText
    .replaceAll('{{TOPIC}}', topic)
    .replaceAll('{{TOPIC_SLUG}}', topicSlug)
    .replaceAll('{{DATE}}', date);
}

async function createArtifact(rootDir, kind, targetPath, topic, topicSlug, date) {
  const absoluteTarget = path.join(rootDir, targetPath);
  if (await fileExists(absoluteTarget)) {
    return { kind, targetPath, created: false };
  }

  const templatePath = path.join(rootDir, templateMap[kind]);
  const templateText = await readFile(templatePath, 'utf8');
  const rendered = fillTemplate(templateText, topic, topicSlug, date);

  await writeFile(absoluteTarget, rendered, 'utf8');

  return { kind, targetPath, created: true };
}

function printUsageAndExit() {
  console.error('Usage: npm run session:start -- "<topic>" [--spec]');
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const includeSpec = args.includes('--spec');
  const topic = args.filter((arg) => arg !== '--spec').join(' ').trim();

  if (!topic) {
    printUsageAndExit();
  }

  const rootDir = process.cwd();
  const date = new Date().toISOString().slice(0, 10);
  const topicSlug = slugifyTopic(topic);
  const artifactPaths = buildArtifactPaths(date, topicSlug, includeSpec);

  await ensureDirectories(rootDir);

  const results = [];
  results.push(await createArtifact(rootDir, 'plan', artifactPaths.plan, topic, topicSlug, date));
  results.push(await createArtifact(rootDir, 'handoff', artifactPaths.handoff, topic, topicSlug, date));

  if (artifactPaths.spec) {
    results.push(await createArtifact(rootDir, 'spec', artifactPaths.spec, topic, topicSlug, date));
  }

  console.log(`Session bootstrap ready for "${topic}".`);
  for (const result of results) {
    const action = result.created ? 'created' : 'kept';
    console.log(`- ${action}: ${result.targetPath}`);
  }

  console.log('');
  console.log('Session checklist:');
  console.log('- Read CLAUDE.md for project rules and doc boundaries.');
  console.log('- Read LESSONS.md for durable takeaways before editing.');
  console.log('- Read the Serena memories relevant to the task.');
  console.log('- Expand the generated plan/spec before changing source files.');
  console.log('- Finish with npm run verify and update CHANGELOG.md, LESSONS.md, and the handoff note.');
}

main().catch((error) => {
  console.error(`session:start failed: ${error.message}`);
  process.exit(1);
});
