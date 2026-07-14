import type { Octokit } from '@octokit/rest';

/** Return true when the user is listed in OWNERS approvers or reviewers. */
export const isListedInOwners = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  username: string,
): Promise<boolean> => {
  try {
    const { data } = await octokit.repos.getContent({ owner, path: 'OWNERS', ref, repo });
    if (!('content' in data) || typeof data.content !== 'string') {
      return false;
    }

    const owners = Buffer.from(data.content, 'base64').toString('utf8');
    return new RegExp(`^\\s*-\\s*${username}\\s*$`, 'm').test(owners);
  } catch {
    return false;
  }
};
