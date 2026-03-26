const runtimePrefixes = ['core/', 'ui/'];
const runtimeFiles = ['app.js', 'index.html', 'style.css', 'package.json', 'package-lock.json'];
const workflowPrefixes = ['.husky/', 'scripts/'];
const workflowFiles = ['CLAUDE.md'];

export function slugifyTopic(topic) {
  return topic
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function buildArtifactPaths(date, topicSlug, includeSpec = false) {
  return {
    plan: `docs/plans/${date}-${topicSlug}.md`,
    handoff: `docs/handoffs/${date}-${topicSlug}.md`,
    spec: includeSpec ? `docs/specs/${date}-${topicSlug}.md` : null,
  };
}

function matchesAnyPath(filePath, exactFiles, prefixes) {
  return exactFiles.includes(filePath) || prefixes.some((prefix) => filePath.startsWith(prefix));
}

export function getWorkflowGuardReport(stagedFiles) {
  const runtimeTouched = stagedFiles.some((filePath) => matchesAnyPath(filePath, runtimeFiles, runtimePrefixes));
  const workflowTouched = stagedFiles.some((filePath) => matchesAnyPath(filePath, workflowFiles, workflowPrefixes));
  const hasChangelog = stagedFiles.includes('CHANGELOG.md');
  const hasLessons = stagedFiles.includes('LESSONS.md');
  const hasPlanOrHandoff = stagedFiles.some(
    (filePath) => filePath.startsWith('docs/plans/') || filePath.startsWith('docs/handoffs/'),
  );

  const errors = [];
  const warnings = [];

  if ((runtimeTouched || workflowTouched) && !hasChangelog) {
    errors.push('Stage CHANGELOG.md whenever runtime or workflow files change.');
  }

  if (runtimeTouched && !hasLessons) {
    errors.push('Stage LESSONS.md whenever runtime behavior or implementation patterns change.');
  }

  if ((runtimeTouched || workflowTouched) && !hasPlanOrHandoff) {
    warnings.push('No docs/plans or docs/handoffs file is staged. Consider leaving a handoff note for the next session.');
  }

  return { errors, warnings };
}
