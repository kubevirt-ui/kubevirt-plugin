import { type CapabilityFeature, CapabilityInstallState } from '../../utils/types';

export const matchesName = (feature: CapabilityFeature, query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  return (
    feature.title.toLowerCase().includes(lowerQuery) ||
    feature.operators.some(({ packageName }) => packageName.toLowerCase().includes(lowerQuery))
  );
};

export const matchesStatus = (
  feature: CapabilityFeature,
  statusFilters: string[],
  getCapabilityInstallState: (f: CapabilityFeature) => CapabilityInstallState,
): boolean => statusFilters.includes(getCapabilityInstallState(feature));

export const sortFeatures = (
  features: CapabilityFeature[],
  sortBy: string,
  direction: string,
  getCapabilityInstallState: (feature: CapabilityFeature) => CapabilityInstallState,
): CapabilityFeature[] => {
  const sorted = [...features];
  if (sortBy === 'name') {
    sorted.sort((a, b) =>
      direction === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title),
    );
  }
  if (sortBy === 'status') {
    sorted.sort((a, b) => {
      const stateA = getCapabilityInstallState(a);
      const stateB = getCapabilityInstallState(b);
      return direction === 'asc' ? stateA.localeCompare(stateB) : stateB.localeCompare(stateA);
    });
  }
  return sorted;
};
