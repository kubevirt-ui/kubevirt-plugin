import { GitCommandError } from './git-helpers';

const formatErrorDetail = (err: unknown): string => {
  if (err instanceof GitCommandError) {
    return [`**Git command:** \`git ${err.command}\``, '', '```', err.stderr, '```'].join('\n');
  }
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
};

/** Format an error for posting on the source PR when /clone fails. */
export const formatCloneFailureMessage = (stage: string, err: unknown, extra?: string): string => {
  const parts = [`**${stage}**`, '', formatErrorDetail(err)];
  if (extra) {
    parts.push('', extra);
  }
  return parts.join('\n');
};
