import type { Octokit } from '@octokit/rest';

/**
 * Return true when the user is listed as an approver of .github/OWNERS --
 * the narrower, security-sensitive OWNERS file (no_parent_owners: true)
 * that gates AI/editor config changes, not the root OWNERS file. Using the
 * root OWNERS here would let every general repo approver use /ai-approved,
 * not just the smaller group trusted for AI-config review (kept in sync
 * with .cursor/OWNERS, which covers the same path set).
 */
export const isListedInAiConfigOwners = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  username: string,
): Promise<boolean> => {
  try {
    const { data } = await octokit.repos.getContent({ owner, path: '.github/OWNERS', ref, repo });
    if (!('content' in data) || typeof data.content !== 'string') {
      return false;
    }

    const owners = Buffer.from(data.content, 'base64').toString('utf8');
    return new RegExp(`^\\s*-\\s*${username}\\s*$`, 'm').test(owners);
  } catch {
    return false;
  }
};
