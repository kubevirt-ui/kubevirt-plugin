import type { Octokit } from '@octokit/rest';

/** GitHub collapses finer-grained roles (e.g. "maintain", "triage") into admin/write/read/none in the `permission` field. */
const WRITE_PERMISSIONS = new Set(['admin', 'write']);

/** True when `username` has write (or higher) access to the repo. Fails closed on lookup failure. */
export const isWriteCollaborator = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  username: string,
): Promise<boolean> => {
  try {
    const { data } = await octokit.repos.getCollaboratorPermissionLevel({ owner, repo, username });
    return WRITE_PERMISSIONS.has(data.permission);
  } catch {
    return false;
  }
};
