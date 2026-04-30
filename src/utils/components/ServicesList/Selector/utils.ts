import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import { getACMTextSearchURL } from '@multicluster/urls';
import { MatchExpression, Operator, Selector } from '@openshift-console/dynamic-plugin-sdk';

const toArray = (value) => (Array.isArray(value) ? value : [value]);

export const requirementToString = (requirement: MatchExpression): string => {
  const requirementStrings = {
    [Operator.DoesNotExist]: `!${requirement.key}`,
    [Operator.Equals]: `${requirement.key}=${requirement.values?.[0]}`,
    [Operator.Exists]: requirement.key,
    [Operator.GreaterThan]: `${requirement.key} > ${requirement.values?.[0]}`,
    [Operator.In]: `${requirement.key} in (${toArray(requirement.values).join(',')})`,
    [Operator.LessThan]: `${requirement.key} < ${requirement.values?.[0]}`,
    [Operator.NotEquals]: `${requirement.key}!=${requirement.values?.[0]}`,
    [Operator.NotIn]: `${requirement.key} notin (${toArray(requirement.values).join(',')})`,
  };

  return requirementStrings[requirement.operator] || '';
};

export const createEquals = (key: string, value: string): MatchExpression => ({
  key,
  operator: Operator.Equals,
  values: [value],
});

const isOldFormat = (selector: Selector) => !selector.matchLabels && !selector.matchExpressions;

export const toRequirements = (selector: Selector = {}) => {
  const matchLabels = isOldFormat(selector) ? selector : selector.matchLabels;
  const { matchExpressions } = selector;

  const requirements = Object.keys(matchLabels || {})
    .sort()
    .map((match) => createEquals(match, matchLabels[match]));

  requirements.push(...(matchExpressions || []));

  return requirements;
};

export const selectorToString = (selector: Selector): string => {
  const requirements = toRequirements(selector);
  return requirements.map(requirementToString).join(',');
};

export const getSelectorSearchURL = (
  requirementAsString: string,
  kind: string,
  namespace: string,
  isACMPage: boolean,
  cluster?: string,
  hubClusterName?: string,
): string => {
  if (cluster || isACMPage) {
    const labelFilters = requirementAsString
      .split(',')
      .map((r) => `label:${r.trim()}`)
      .join(' ');
    const selectedCluster = cluster || hubClusterName;
    const clusterPart =
      selectedCluster && selectedCluster !== ALL_CLUSTERS_KEY ? `cluster:${selectedCluster} ` : '';
    const namespacePart = namespace ? ` namespace:${namespace}` : '';
    const textSearch = `${clusterPart}kind:${kind}${namespacePart} ${labelFilters}`;
    return getACMTextSearchURL(textSearch);
  }

  const requirementAsUrlEncodedString = encodeURIComponent(requirementAsString);
  return `/search/ns/${
    namespace || 'all-namespaces'
  }?kind=${kind}&q=${requirementAsUrlEncodedString}`;
};
