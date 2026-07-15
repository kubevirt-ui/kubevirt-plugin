// Shared by every issue_comment PR command's actions/github-script step
// (/retest-e2e, /cancel-e2e, /hold-e2e) for the two bits of logic they all
// duplicate identically: a best-effort emoji reaction, and the OWNERS
// trust-check + reject. Each caller already runs actions/checkout earlier
// in the same job, so this resolves via a plain relative require().

// Never let a reaction failure block the command's actual logic.
async function reactToComment(github, context, core, content) {
  try {
    await github.rest.reactions.createForIssueComment({
      ...context.repo,
      comment_id: context.payload.comment.id,
      content,
    });
  } catch (err) {
    core.warning(`Could not react to comment with "${content}": ${err.message || err}`);
  }
}

// Logs the trust decision and, if untrusted, reacts -1 + core.setFailed.
// Returns true if the caller should proceed, false if it should return.
async function enforceCommentTrust(core, react, author, trusted, command) {
  core.info(
    `${author} is ${trusted ? '' : 'not '}listed in OWNERS (approvers/reviewers) — ${trusted ? 'trusted' : `untrusted, ignoring ${command}`}.`,
  );
  if (!trusted) {
    await react('-1');
    core.setFailed(`${author} is not authorized to use ${command}`);
    return false;
  }
  return true;
}

module.exports = { reactToComment, enforceCommentTrust };
