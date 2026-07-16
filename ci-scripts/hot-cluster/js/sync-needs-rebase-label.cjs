// Applies/removes the needs-rebase label based on GitHub's own computed
// `mergeable` field. Shared by needs-rebase.yml's PR-triggered and
// push-to-main-triggered jobs.
const { NEEDS_REBASE_LABEL } = require('./merge-pool-labels.cjs');

const LABEL_META = {
  color: 'e99695',
  description:
    'This PR has a merge conflict with its base branch -- rebase or merge the base branch in to resolve',
};
const COMMENT_MARKER = '<!-- needs-rebase-comment -->';

async function hasNeedsRebaseComment(github, context, prNumber) {
  const comments = await github.paginate(github.rest.issues.listComments, {
    ...context.repo,
    issue_number: prNumber,
    per_page: 100,
  });
  return comments.some((comment) => (comment.body || '').includes(COMMENT_MARKER));
}

async function syncNeedsRebaseLabel({ github, core, context, prNumber }) {
  const { data: pr } = await github.rest.pulls.get({ ...context.repo, pull_number: prNumber });

  // GitHub computes mergeability asynchronously -- null means "not
  // computed yet", not "no conflict". Skip this pass rather than guess;
  // a later event (the PR's next push, or the next push to main) retries.
  if (pr.mergeable === null) {
    core.info(`PR #${prNumber}: mergeable state not yet computed by GitHub -- skipping this pass.`);
    return;
  }

  const hasLabel = (pr.labels || []).some((label) => label.name === NEEDS_REBASE_LABEL);

  if (pr.mergeable === false) {
    if (!hasLabel) {
      core.info(
        `PR #${prNumber}: has a merge conflict with '${pr.base.ref}' -- applying '${NEEDS_REBASE_LABEL}'.`,
      );
      try {
        await github.rest.issues.getLabel({ ...context.repo, name: NEEDS_REBASE_LABEL });
      } catch (err) {
        if (err.status !== 404) throw err;
        try {
          await github.rest.issues.createLabel({
            ...context.repo,
            name: NEEDS_REBASE_LABEL,
            ...LABEL_META,
          });
        } catch (createErr) {
          // 422 already_exists: a concurrent run created it first -- fine,
          // addLabels below will still succeed against the existing label.
          if (createErr.status !== 422) throw createErr;
        }
      }
      await github.rest.issues.addLabels({
        ...context.repo,
        issue_number: prNumber,
        labels: [NEEDS_REBASE_LABEL],
      });
    } else {
      core.info(
        `PR #${prNumber}: still has a merge conflict, '${NEEDS_REBASE_LABEL}' already applied.`,
      );
    }

    // Marker dedupe: only post once per conflict stretch, even if the label
    // was removed manually and re-applied, or two runners race on first apply.
    if (!(await hasNeedsRebaseComment(github, context, prNumber))) {
      await github.rest.issues.createComment({
        ...context.repo,
        issue_number: prNumber,
        body: [
          COMMENT_MARKER,
          `@${pr.user.login}: this PR has a merge conflict with the \`${pr.base.ref}\` branch and needs a rebase (or merging \`${pr.base.ref}\` into your branch) before it can be tested or merged.`,
          `The \`${NEEDS_REBASE_LABEL}\` label will be removed automatically once resolved.`,
        ].join('\n\n'),
      });
    }
    return;
  }

  // pr.mergeable === true -- drop the label (if still present) and clear
  // marker comments so a later conflict stretch can post a fresh notice.
  if (hasLabel) {
    core.info(
      `PR #${prNumber}: no longer has a merge conflict -- removing '${NEEDS_REBASE_LABEL}'.`,
    );
    try {
      await github.rest.issues.removeLabel({
        ...context.repo,
        issue_number: prNumber,
        name: NEEDS_REBASE_LABEL,
      });
    } catch (err) {
      if (err.status !== 404) throw err;
    }
  }

  const comments = await github.paginate(github.rest.issues.listComments, {
    ...context.repo,
    issue_number: prNumber,
    per_page: 100,
  });
  for (const comment of comments) {
    if (!(comment.body || '').includes(COMMENT_MARKER)) continue;
    try {
      await github.rest.issues.deleteComment({ ...context.repo, comment_id: comment.id });
    } catch (err) {
      if (err.status !== 404) throw err;
    }
  }
}

module.exports = { syncNeedsRebaseLabel, NEEDS_REBASE_LABEL, COMMENT_MARKER };
