import React, { FC, useState } from 'react';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import useHyperConvergeConfiguration, {
  HyperConverged,
} from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
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

const KernelSamepageMerging: FC = () => {
  const { t } = useKubevirtTranslation();
  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration();
  const ksmConfiguration = hyperConverge?.spec?.configuration?.ksmConfiguration;
  const [isEnabled, setIsEnabled] = useState(
    !!(ksmConfiguration && isEmpty(ksmConfiguration?.nodeLabelSelector)), // Empty nodeLabelSelector will enable KSM on every node.
  );
  const [error, setError] = useState(null);

  const onKSMchange = (value: boolean) => {
    k8sPatch<HyperConverged>({
      data: [
        {
          op: 'replace',
          path: `/spec/configuration/ksmConfiguration/nodeLabelSelector`,
          value: value ? {} : null,
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
        </SplitItem>
        {hyperLoaded && (
          <SplitItem>
            <Switch id="kernel-samepage-merging" isChecked={isEnabled} onChange={onKSMchange} />
          </SplitItem>
        )}
      </Split>
      {(error || hyperLoadingError) && (
        <Alert
          className="KernelSamepageMerging__Alert"
          isInline
          title={t('An error occurred')}
          variant={AlertVariant.danger}
        >
          {error || hyperLoadingError}
        </Alert>
      )}
    </>
  );
};

export default KernelSamepageMerging;
