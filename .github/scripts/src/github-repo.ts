import { Octokit } from '@octokit/rest';

import type { GitHubConfig } from './types/index';

/** Create an authenticated Octokit instance. */
export const createOctokit = (config: GitHubConfig): Octokit => new Octokit({ auth: config.token });

/** Create an Octokit instance scoped to config.statusToken (falls back to config.token) -- for calls a bot app token lacks the scope for, e.g. commit statuses or reading repo contents. */
export const createStatusOctokit = (config: GitHubConfig): Octokit =>
  new Octokit({ auth: config.statusToken ?? config.token });

/** Fetch all branch names matching "release-*" from the repo. */
export const getReleaseBranches = async (
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<string[]> => {
  const allBranches = await octokit.paginate(octokit.repos.listBranches, {
    owner,
    per_page: 100,
    repo,
  });

  return allBranches
    .filter((branch) => branch.name.startsWith('release-'))
    .map((branch) => branch.name);
};

/** Check if a branch exists in the repo. */
export const branchExists = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
): Promise<boolean> => {
  try {
    await octokit.repos.getBranch({ branch, owner, repo });
    return true;
  } catch {
    return false;
  }
};

/** List all file paths changed in a pull request. */
export const getPullRequestFiles = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<Array<{ filename: string; patch?: string }>> =>
  octokit.paginate(octokit.pulls.listFiles, {
    owner,
    per_page: 100,
    pull_number: pullNumber,
    repo,
  });

/** Create a pull request and return its number and URL. */
export const createPullRequest = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  params: {
    base: string;
    body: string;
    draft?: boolean;
    head: string;
    title: string;
  },
): Promise<{ html_url: string; number: number }> => {
  const { data } = await octokit.pulls.create({ owner, repo, ...params });
  return { html_url: data.html_url, number: data.number };
};
