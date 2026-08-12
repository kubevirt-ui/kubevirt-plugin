import { type ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';
import {
  type AllQuickStartStates,
  getQuickStartStatus,
  type QuickStart,
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

  const isFeatured = (quickStart: Merge<QuickStart, { metadata: ObjectMetadata }>): boolean =>
    featured?.includes(quickStart?.metadata?.name);
  const getStatus = (
    quickStart: Merge<QuickStart, { metadata: ObjectMetadata }>,
  ): QuickStartStatus => getQuickStartStatus(allQuickStartStates, quickStart?.metadata?.name);

  // Prioritize featured quick starts and keep specified order
  if (featured) {
    const featuredQuickStartsByName = filteredQuickStarts.reduce(
      (acc, qsItem) => {
        acc[qsItem?.metadata?.name] = qsItem;
        return acc;
      },
      {} as Record<string, Merge<QuickStart, { metadata: ObjectMetadata }>>,
    );
    for (const quickStartName of featured) {
      if (
        featuredQuickStartsByName[quickStartName] &&
        getStatus(featuredQuickStartsByName[quickStartName]) !== QuickStartStatus.COMPLETE
      ) {
        orderedQuickStarts.push(featuredQuickStartsByName[quickStartName]);
      }
    }
  }

  // Show non-featured in progress quick starts
  orderedQuickStarts.push(
    ...filteredQuickStarts.filter(
      (quickStart) =>
        !isFeatured(quickStart) && getStatus(quickStart) === QuickStartStatus.IN_PROGRESS,
    ),
  );

  // Show non-featured completed and unstarted quick starts
  orderedQuickStarts.push(
    ...filteredQuickStarts.filter(
      (quickStart) =>
        !isFeatured(quickStart) &&
        (getStatus(quickStart) === QuickStartStatus.NOT_STARTED ||
          getStatus(quickStart) === QuickStartStatus.COMPLETE),
    ),
  );
  return orderedQuickStarts;
};
