import { ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';
import {
  AllQuickStartStates,
  getQuickStartStatus,
  QuickStart,
  QuickStartStatus,
} from '@patternfly/quickstarts';

type Merge<A, B> = { [K in keyof (A | B)]: K extends keyof B ? B[K] : A[K] };

export const orderQuickStarts = (
  allQuickStarts: Merge<QuickStart, { metadata: ObjectMetadata }>[],
  allQuickStartStates: AllQuickStartStates,
  featured: string[],
  filter?: (QuickStart) => boolean,
): Merge<QuickStart[], { metadata: ObjectMetadata }>[] => {
  const orderedQuickStarts: Merge<QuickStart, { metadata: ObjectMetadata }>[] = [];
  const filteredQuickStarts = filter ? allQuickStarts.filter(filter) : allQuickStarts;
  const isFeatured = (quickStart: Merge<QuickStart, { metadata: ObjectMetadata }>) =>
    featured?.includes(quickStart?.metadata?.name);
  const getStatus = (quickStart: Merge<QuickStart, { metadata: ObjectMetadata }>) =>
    getQuickStartStatus(allQuickStartStates, quickStart?.metadata?.name);
  // Prioritize featured quick starts and keep specified order
  if (featured) {
    const featuredQuickStartsByName = filteredQuickStarts.reduce((acc, q) => {
      acc[q?.metadata?.name] = q;
      return acc;
    }, {} as Record<string, Merge<QuickStart, { metadata: ObjectMetadata }>>);
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
