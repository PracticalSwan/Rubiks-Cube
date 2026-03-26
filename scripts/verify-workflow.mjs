// Repository workflow verifier that checks required files, scripts, and docs guidance are present.
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { getWorkflowVerificationContract } from './workflow-lib.mjs';

async function assertPathExists(rootDir, relativePath) {
  await access(path.join(rootDir, relativePath));
}

async function main() {
  const rootDir = process.cwd();
  const missingPaths = [];
  const { requiredPaths, requiredScripts } = getWorkflowVerificationContract();

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

  // Package scripts are part of the workflow contract, so they are verified alongside files.
  const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'));
  const missingScripts = requiredScripts.filter(
    (scriptName) => !(scriptName in packageJson.scripts)
  );

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
  // A hard failure is preferable here because partial workflow setup defeats the purpose of verification.
  console.error(`workflow:verify failed: ${error.message}`);
  process.exit(1);
});
