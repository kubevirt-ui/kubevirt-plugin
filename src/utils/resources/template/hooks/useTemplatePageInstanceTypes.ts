import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';

/** Instance types for template CPU/memory; Console SDK deduplicates identical watches. */
const useTemplatePageInstanceTypes = (
  namespace?: string,
  cluster?: string,
): InstanceTypeUnion[] => {
  const { allInstanceTypes } = useInstanceTypesAndPreferences(
    isAllNamespaces(namespace) ? undefined : namespace,
    cluster,
  );

  return allInstanceTypes;
};

export default useTemplatePageInstanceTypes;
