import test from 'node:test';
import assert from 'node:assert/strict';

async function loadWorkflowLib() {
  return import('../../scripts/workflow-lib.mjs');
}

test('slugifyTopic converts mixed input into a dated-doc slug', async () => {
  const { slugifyTopic } = await loadWorkflowLib();

  assert.equal(slugifyTopic('  Agentic Workflow: Session Start  '), 'agentic-workflow-session-start');
});

test('buildArtifactPaths returns dated plan and handoff files', async () => {
  const { buildArtifactPaths } = await loadWorkflowLib();

  assert.deepEqual(buildArtifactPaths('2026-03-26', 'agentic-workflow', true), {
    plan: 'docs/plans/2026-03-26-agentic-workflow.md',
    handoff: 'docs/handoffs/2026-03-26-agentic-workflow.md',
    spec: 'docs/specs/2026-03-26-agentic-workflow.md',
  });
});

test('getWorkflowGuardReport requires changelog and lessons for source changes', async () => {
  const { getWorkflowGuardReport } = await loadWorkflowLib();

  const report = getWorkflowGuardReport(['core/RubiksCube.js', 'ui/UtilityControls.js']);

  assert.deepEqual(report.errors, [
    'Stage CHANGELOG.md whenever runtime or workflow files change.',
    'Stage LESSONS.md whenever runtime behavior or implementation patterns change.',
  ]);
  assert.deepEqual(report.warnings, [
    'No docs/plans or docs/handoffs file is staged. Consider leaving a handoff note for the next session.',
  ]);
});

test('getWorkflowGuardReport allows doc-only updates to pass quietly', async () => {
  const { getWorkflowGuardReport } = await loadWorkflowLib();

  const report = getWorkflowGuardReport(['docs/plans/2026-03-26-agentic-workflow.md']);

  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.warnings, []);
});
