import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const requiredPaths = [
  '.husky/post-checkout',
  '.husky/post-merge',
  '.husky/pre-commit',
  '.husky/pre-push',
  'docs/README.md',
  'docs/specs/2026-03-26-agentic-workflow-spec.md',
  'docs/plans/2026-03-26-agentic-workflow-bootstrap.md',
  'docs/handoffs/2026-03-26-agentic-workflow-bootstrap.md',
  'docs/templates/implementation-plan-template.md',
  'docs/templates/spec-template.md',
  'docs/templates/handoff-template.md',
  'scripts/workflow-lib.mjs',
  'scripts/session-start.mjs',
  'scripts/check-workflow-changes.mjs',
  'tests/workflow/workflow-lib.test.mjs',
];

const requiredScripts = ['prepare', 'session:start', 'workflow:guard', 'workflow:verify', 'test', 'verify'];

async function assertPathExists(rootDir, relativePath) {
  await access(path.join(rootDir, relativePath));
}

async function main() {
  const rootDir = process.cwd();
  const missingPaths = [];

  for (const relativePath of requiredPaths) {
    try {
      await assertPathExists(rootDir, relativePath);
    } catch {
      missingPaths.push(relativePath);
    }
  }

  if (missingPaths.length > 0) {
    console.error('workflow:verify missing required files:');
    for (const missingPath of missingPaths) {
      console.error(`- ${missingPath}`);
    }
    process.exit(1);
  }

  const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'));
  const missingScripts = requiredScripts.filter((scriptName) => !(scriptName in packageJson.scripts));

  if (missingScripts.length > 0) {
    console.error('workflow:verify missing required package scripts:');
    for (const scriptName of missingScripts) {
      console.error(`- ${scriptName}`);
    }
    process.exit(1);
  }

  const docsReadme = await readFile(path.join(rootDir, 'docs/README.md'), 'utf8');
  if (!docsReadme.includes('npm run session:start')) {
    console.error('workflow:verify expected docs/README.md to document npm run session:start.');
    process.exit(1);
  }

  console.log('workflow:verify passed.');
}

main().catch((error) => {
  console.error(`workflow:verify failed: ${error.message}`);
  process.exit(1);
});
