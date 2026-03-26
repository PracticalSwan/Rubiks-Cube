import { expect, test } from 'vitest';

async function loadWorkflowLib() {
  return import('../../scripts/workflow-lib.mjs');
}

// Workflow helpers are kept under test because the docs guardrails are easy to regress silently.
test('slugifyTopic converts mixed input into a dated-doc slug', async () => {
  const { slugifyTopic } = await loadWorkflowLib();

  expect(slugifyTopic('  Agentic Workflow: Session Start  ')).toBe(
    'agentic-workflow-session-start'
  );
});

test('buildArtifactPaths returns dated plan and handoff files', async () => {
  const { buildArtifactPaths } = await loadWorkflowLib();

  expect(buildArtifactPaths('2026-03-26', 'agentic-workflow', true)).toEqual({
    plan: 'docs/plans/2026-03-26-agentic-workflow.md',
    handoff: 'docs/handoffs/2026-03-26-agentic-workflow.md',
    spec: 'docs/specs/2026-03-26-agentic-workflow.md',
  });
});

test('workflow verification contract keeps reusable directories but not fixed dated artifacts', async () => {
  const { getWorkflowVerificationContract } = await loadWorkflowLib();

  expect(getWorkflowVerificationContract()).toEqual({
    requiredPaths: [
      '.husky/post-checkout',
      '.husky/post-merge',
      '.husky/pre-commit',
      '.husky/pre-push',
      'docs/README.md',
      'docs/specs',
      'docs/plans',
      'docs/handoffs',
      'docs/templates/implementation-plan-template.md',
      'docs/templates/spec-template.md',
      'docs/templates/handoff-template.md',
      'scripts/workflow-lib.mjs',
      'scripts/session-start.mjs',
      'scripts/check-workflow-changes.mjs',
      'tests/workflow/workflow-lib.test.mjs',
    ],
    requiredScripts: [
      'prepare',
      'session:start',
      'workflow:guard',
      'workflow:verify',
      'test',
      'verify',
    ],
  });
});

test('getWorkflowGuardReport requires changelog and lessons for source changes', async () => {
  const { getWorkflowGuardReport } = await loadWorkflowLib();

  const report = getWorkflowGuardReport(['core/RubiksCube.js', 'ui/UtilityControls.js']);

  expect(report.errors).toEqual([
    'Stage CHANGELOG.md whenever runtime or workflow files change.',
    'Stage LESSONS.md whenever runtime behavior or implementation patterns change.',
  ]);
  expect(report.warnings).toEqual([
    'No docs/plans or docs/handoffs file is staged. Consider leaving a handoff note for the next session.',
  ]);
});

test('getWorkflowGuardReport skips runtime docs requirements for comment-only source edits', async () => {
  const { getWorkflowGuardReport } = await loadWorkflowLib();

  const report = getWorkflowGuardReport(['core/RubiksCube.js'], {
    hasMeaningfulRuntimeChanges: false,
  });

  expect(report.errors).toEqual([]);
  expect(report.warnings).toEqual([]);
});

test('getWorkflowGuardReport allows doc-only updates to pass quietly', async () => {
  const { getWorkflowGuardReport } = await loadWorkflowLib();

  const report = getWorkflowGuardReport(['docs/plans/2026-03-26-agentic-workflow.md']);

  expect(report.errors).toEqual([]);
  expect(report.warnings).toEqual([]);
});

test('hasMeaningfulChangedLines ignores comment-only patches but catches behavior changes', async () => {
  const { hasMeaningfulChangedLines } = await loadWorkflowLib();

  const commentOnlyPatch = [
    'diff --git a/core/RubiksCube.js b/core/RubiksCube.js',
    '--- a/core/RubiksCube.js',
    '+++ b/core/RubiksCube.js',
    '@@ -1,0 +1,1 @@',
    '+// Explains why pivot groups are used during animation.',
  ].join('\n');
  const behaviorPatch = [
    'diff --git a/core/RubiksCube.js b/core/RubiksCube.js',
    '--- a/core/RubiksCube.js',
    '+++ b/core/RubiksCube.js',
    '@@ -10,1 +10,1 @@',
    '-const value = 1;',
    '+const value = 2;',
  ].join('\n');

  expect(hasMeaningfulChangedLines('core/RubiksCube.js', commentOnlyPatch)).toBe(false);
  expect(hasMeaningfulChangedLines('core/RubiksCube.js', behaviorPatch)).toBe(true);
});
