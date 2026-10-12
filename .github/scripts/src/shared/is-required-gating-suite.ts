export const isRequiredGatingSuite = (testProject: string, testArgs: string): boolean => {
  const project = testProject.trim().toLowerCase();
  return (project === 'gating' || project === '') && testArgs.trim() === '';
};
