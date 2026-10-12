import type { Octokit } from '@octokit/rest';

export type PrDetails = {
  author: string;
  baseRef: string;
  headSha: string;
  mergeCommitSha: string;
  number: number;
  title: string;
};

/** Fetch a pull request and return a normalized subset of its fields. */
export const fetchPr = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<PrDetails> => {
  const { data } = await octokit.pulls.get({ owner, pull_number: pullNumber, repo });
  return {
    author: data.user?.login ?? '',
    baseRef: data.base.ref,
    headSha: data.head.sha,
    mergeCommitSha: data.merge_commit_sha ?? '',
    number: data.number,
    title: data.title,
  };
};
