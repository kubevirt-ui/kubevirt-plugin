import React, { FC, useEffect, useState } from 'react';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  PopoverPosition,
  Split,
  SplitItem,
  Switch,
} from '@patternfly/react-core';

import './KernelSamepageMerging.scss';

type KernelSamepageMergingProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
  newBadge?: boolean;
};
const KernelSamepageMerging: FC<KernelSamepageMergingProps> = ({
  hyperConvergeConfiguration,
  newBadge = false,
}) => {
  const { t } = useKubevirtTranslation();
  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const ksmConfiguration = hyperConverge?.spec?.ksmConfiguration;
  const [isEnabled, setIsEnabled] = useState<boolean>();

  useEffect(
    () =>
      hyperLoaded &&
      setIsEnabled(
        !!(
          ksmConfiguration?.hasOwnProperty('nodeLabelSelector') &&
          // Empty nodeLabelSelector will enable KSM on every node.
          isEmpty(ksmConfiguration?.nodeLabelSelector)
        ),
      ),
    [ksmConfiguration, hyperLoaded],
  );

  const [error, setError] = useState(null);

  const onKSMchange = (value: boolean) => {
    k8sPatch<HyperConverged>({
      data: [
        {
          op: !ksmConfiguration ? 'add' : 'replace',
          path: `/spec/ksmConfiguration`,
          value: value ? { nodeLabelSelector: {} } : {},
        },
      ],
      model: HyperConvergedModel,
      resource: hyperConverge,
    })
      .then(() => setIsEnabled(value))
      .catch((err) => setError(err.message));
  };

  return (
    <>
      <Split>
        <SplitItem isFilled>
          {t('Kernel Samepage Merging (KSM)')}{' '}
          <HelpTextIcon
            bodyContent={t(
              'KSM is a memory-saving deduplication feature designed to fit more VirtualMachines into physical memory by sharing the data common between them. It is specifically effective for similar VirtualMachines. KSM should only be used with trusted workloads. Turning this feature on enables it for all nodes in the cluster.',
            )}
            className="KernelSamepageMerging__HelpTextIcon"
            helpIconClassName="KernelSamepageMerging__HelpIcon"
            position={PopoverPosition.bottom}
          />
          {newBadge && <NewBadge />}
        </SplitItem>
        {hyperLoaded && (
          <SplitItem>
            <Switch
              id="kernel-samepage-merging"
              isChecked={isEnabled}
              onChange={(_, checked: boolean) => onKSMchange(checked)}
            />
          </SplitItem>
        )}
      </Split>
      {error && (
        <Alert
          className="KernelSamepageMerging__Alert"
          isInline
          title={t('An error occurred')}
          variant={AlertVariant.danger}
        >
          {error}
        </Alert>
      )}
    </>
  );
};

export default KernelSamepageMerging;
