import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type RunStrategy, RUNSTRATEGY_RERUNONFAILURE } from '@kubevirt-utils/resources/vm';
import { Alert, AlertVariant } from '@patternfly/react-core';

type RerunOnFailureCloneWarningProps = {
  runStrategy: RunStrategy | undefined;
  startCloneVM: boolean;
};

const RerunOnFailureCloneWarning: FC<RerunOnFailureCloneWarningProps> = ({
  runStrategy,
  startCloneVM,
}) => {
  const { t } = useKubevirtTranslation();

  if (runStrategy !== RUNSTRATEGY_RERUNONFAILURE || startCloneVM) {
    return null;
  }

  return (
    <Alert
      className="pf-v6-u-mt-md"
      data-test="rerun-on-failure-clone-warning"
      isInline
      title={t('Cloned VirtualMachine will be Halted')}
      variant={AlertVariant.warning}
    >
      {t(
        'The source VirtualMachine uses the "RerunOnFailure" run strategy. If it is not started on creation, the cloned VirtualMachine will use a "Halted" run strategy.',
      )}
    </Alert>
  );
};

export default RerunOnFailureCloneWarning;
