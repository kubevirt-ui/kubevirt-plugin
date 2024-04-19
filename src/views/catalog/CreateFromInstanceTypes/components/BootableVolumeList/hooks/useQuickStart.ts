import useQuickStarts from '@kubevirt-utils/hooks/useQuickStarts/useQuickStarts';
import { getName } from '@kubevirt-utils/resources/shared';
import { QuickStart } from '@patternfly/quickstarts';

type UseQuickStart = (quickStartId: string) => [QuickStart, boolean];

const useQuickStart: UseQuickStart = (quickStartId) => {
  const [quickStarts, quickStartsLoaded] = useQuickStarts();

  const quickStart = quickStarts.find((qs) => getName(qs) === quickStartId);

  return [quickStart, quickStartsLoaded];
};

export default useQuickStart;
