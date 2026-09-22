export const buildSourcePrCloneSuccessComment = (params: {
  cherryPickClean: boolean;
  conflictDetails: string;
  newPrUrl: string;
  targetBranch: string;
}): string => {
  const statusIcon = params.cherryPickClean ? ':white_check_mark:' : ':warning:';
  const draftNote = params.cherryPickClean ? '' : ' (opened as **draft**)';
  const cherryPickNote = params.cherryPickClean
    ? 'Cherry-pick: clean.'
    : `Cherry-pick: conflicts — resolve in the new PR:\n\`\`\`\n${params.conflictDetails}\n\`\`\``;

  return [
    `${statusIcon} **Clone to \`${params.targetBranch}\` complete**${draftNote}`,
    '',
    `New PR: ${params.newPrUrl}`,
    '',
    cherryPickNote,
  ].join('\n');
};
