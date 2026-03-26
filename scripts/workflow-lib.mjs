// Shared helpers for naming workflow artifacts and deciding when docs updates are required.
// These path groups define what counts as runtime behavior versus workflow-only scaffolding.
const runtimePrefixes = ['core/', 'ui/'];
const runtimeFiles = ['app.js', 'index.html', 'style.css', 'package.json', 'package-lock.json'];
const workflowPrefixes = ['.husky/', 'scripts/'];
const workflowFiles = ['CLAUDE.md'];
const SCRIPT_COMMENT_PATTERNS = [/^\/\//, /^\/\*/, /^\*/, /^\*\//];
const CSS_COMMENT_PATTERNS = [/^\/\*/, /^\*/, /^\*\//];
const HTML_COMMENT_PATTERNS = [/^<!--/, /^-->/];
const requiredWorkflowPaths = [
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
];
const requiredWorkflowScripts = [
  'prepare',
  'session:start',
  'workflow:guard',
  'workflow:verify',
  'test',
  'verify',
];

export function slugifyTopic(topic) {
  return topic
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

// Artifact paths are generated centrally so plans, handoffs, and specs always share the same naming scheme.
export function buildArtifactPaths(date, topicSlug, includeSpec = false) {
  return {
    plan: `docs/plans/${date}-${topicSlug}.md`,
    handoff: `docs/handoffs/${date}-${topicSlug}.md`,
    spec: includeSpec ? `docs/specs/${date}-${topicSlug}.md` : null,
  };
}

// Workflow verification should enforce reusable structure, not one fixed dated session snapshot.
export function getWorkflowVerificationContract() {
  return {
    requiredPaths: [...requiredWorkflowPaths],
    requiredScripts: [...requiredWorkflowScripts],
  };
}

function matchesAnyPath(filePath, exactFiles, prefixes) {
  return exactFiles.includes(filePath) || prefixes.some((prefix) => filePath.startsWith(prefix));
}

function getCommentPatterns(filePath) {
  if (filePath.endsWith('.html')) {
    return HTML_COMMENT_PATTERNS;
  }

  if (filePath.endsWith('.css')) {
    return CSS_COMMENT_PATTERNS;
  }

  if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
    return SCRIPT_COMMENT_PATTERNS;
  }

  return [];
}

function isIgnorableChangedLine(filePath, line) {
  const trimmed = line.trim();

  if (!trimmed) {
    return true;
  }

  return getCommentPatterns(filePath).some((pattern) => pattern.test(trimmed));
}

export function isRuntimePath(filePath) {
  return matchesAnyPath(filePath, runtimeFiles, runtimePrefixes);
}

export function isWorkflowPath(filePath) {
  return matchesAnyPath(filePath, workflowFiles, workflowPrefixes);
}

// Comment-only patches should not force runtime lessons/changelog updates when behavior did not change.
export function hasMeaningfulChangedLines(filePath, patchText) {
  return patchText
    .split(/\r?\n/)
    .filter((line) => /^[+-]/.test(line) && !/^(?:\+\+\+|---)/.test(line))
    .some((line) => !isIgnorableChangedLine(filePath, line.slice(1)));
}

// The guard report separates blocking policy failures from softer documentation reminders.
export function getWorkflowGuardReport(stagedFiles, { hasMeaningfulRuntimeChanges } = {}) {
  const runtimeTouched = stagedFiles.some((filePath) => isRuntimePath(filePath));
  const workflowTouched = stagedFiles.some((filePath) => isWorkflowPath(filePath));
  const documentedRuntimeTouched = hasMeaningfulRuntimeChanges ?? runtimeTouched;
  const hasChangelog = stagedFiles.includes('CHANGELOG.md');
  const hasLessons = stagedFiles.includes('LESSONS.md');
  const hasPlanOrHandoff = stagedFiles.some(
    (filePath) => filePath.startsWith('docs/plans/') || filePath.startsWith('docs/handoffs/')
  );

  const errors = [];
  const warnings = [];

  if ((documentedRuntimeTouched || workflowTouched) && !hasChangelog) {
    errors.push('Stage CHANGELOG.md whenever runtime or workflow files change.');
  }

  if (documentedRuntimeTouched && !hasLessons) {
    errors.push('Stage LESSONS.md whenever runtime behavior or implementation patterns change.');
  }

  if ((documentedRuntimeTouched || workflowTouched) && !hasPlanOrHandoff) {
    warnings.push(
      'No docs/plans or docs/handoffs file is staged. Consider leaving a handoff note for the next session.'
    );
  }

  return { errors, warnings };
}
