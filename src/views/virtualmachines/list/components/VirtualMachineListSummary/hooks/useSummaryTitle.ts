import { useParams } from 'react-router-dom-v5-compat';

import useIsACMPage from '@kubevirt-utils/hooks/useIsACMPage';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const useSummaryTitle = (namespace: string): string => {
  const isACM = useIsACMPage();
  const { t } = useKubevirtTranslation();

  const { cluster } = useParams();

  if (isACM) {
    if (cluster && !namespace) return t('{{cluster}} cluster', { cluster });

    if (!cluster) return t('All clusters summary');

    return `${cluster} -> ${namespace}`;
  }

  return namespace ?? t('All projects summary');
};

export default useSummaryTitle;
