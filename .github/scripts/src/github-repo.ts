import { Octokit } from '@octokit/rest';

import type { GitHubConfig } from './types/index.js';

/** Create an authenticated Octokit instance. */
export const createOctokit = (config: GitHubConfig): Octokit => new Octokit({ auth: config.token });

/** Fetch all branch names matching "release-*" from the repo. */
export const getReleaseBranches = async (
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<string[]> => {
  const branches: string[] = [];
  let page = 1;

  while (true) {
    const { data } = await octokit.repos.listBranches({ owner, repo, per_page: 100, page });

    if (data.length === 0) break;

    for (const branch of data) {
      if (branch.name.startsWith('release-')) {
        branches.push(branch.name);
      }
    }

    if (data.length < 100) break;
    page++;
  }

  return branches;
};

/** Check if a branch exists in the repo. */
export const branchExists = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
): Promise<boolean> => {
  try {
    await octokit.repos.getBranch({ owner, repo, branch });
    return true;
  } catch {
    return false;
  }
};

/** Create a pull request and return its number and URL. */
export const createPullRequest = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  params: {
    title: string;
    body: string;
    head: string;
    base: string;
    draft?: boolean;
  },
): Promise<{ number: number; html_url: string }> => {
  const { data } = await octokit.pulls.create({ owner, repo, ...params });
  return { number: data.number, html_url: data.html_url };
};
