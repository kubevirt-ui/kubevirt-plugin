export type ValidationCommand = 'recheck-jira' | 'ai-approved';

export const parseCommand = (commentBody: string): ValidationCommand | null => {
  if (commentBody.includes('/recheck-jira')) {
    return 'recheck-jira';
  }
  if (commentBody.includes('/ai-approved')) {
    return 'ai-approved';
  }
  return null;
};
