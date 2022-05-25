import {
  AllQuickStartStates,
  getQuickStartStatus,
  QuickStart,
  QuickStartStatus,
} from '@patternfly/quickstarts';

export const orderQuickStarts = (
  allQuickStarts: QuickStart[],
  allQuickStartStates: AllQuickStartStates,
  featured: string[],
  filter?: (QuickStart) => boolean,
): QuickStart[] => {
  const orderedQuickStarts: QuickStart[] = [];

  const filteredQuickStarts = filter ? allQuickStarts.filter(filter) : allQuickStarts;

  const isFeatured = (quickStart: QuickStart) => featured?.includes(quickStart.metadata.name);
  const getStatus = (quickStart: QuickStart) =>
    getQuickStartStatus(allQuickStartStates, quickStart.metadata.name);

  // Prioritize featured quick starts and keep specified order
  if (featured) {
    const featuredQuickStartsByName = filteredQuickStarts.reduce((acc, q) => {
      acc[q.metadata.name] = q;
      return acc;
    }, {} as Record<string, QuickStart>);
    featured.forEach((quickStartName) => {
      if (
        featuredQuickStartsByName[quickStartName] &&
        getStatus(featuredQuickStartsByName[quickStartName]) !== QuickStartStatus.COMPLETE
      ) {
        orderedQuickStarts.push(featuredQuickStartsByName[quickStartName]);
      }
    });
  }

  // Show other in progress quick starts (which are not featured)
  orderedQuickStarts.push(
    ...filteredQuickStarts.filter(
      (q) => !isFeatured(q) && getStatus(q) === QuickStartStatus.IN_PROGRESS,
    ),
  );

  // Show other not started quick starts (which are not featured)
  orderedQuickStarts.push(
    ...filteredQuickStarts.filter(
      (q) => !isFeatured(q) && getStatus(q) === QuickStartStatus.NOT_STARTED,
    ),
  );

  return orderedQuickStarts;
};
