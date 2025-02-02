import React, { FC } from 'react';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import MetadataLabels from '@kubevirt-utils/components/MetadataLabels/MetadataLabels';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import './labels.scss';

type LabelsProps = {
  vmi: V1VirtualMachineInstance;
};

const Labels: FC<LabelsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <VirtualMachineDescriptionItem
      bodyContent={t(
        'Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services.',
      )}
      descriptionData={
        <MetadataLabels labels={vmi?.metadata?.labels} model={VirtualMachineInstanceModel} />
      }
      onEditClick={() =>
        createModal((props) => (
          <LabelsModal
            obj={vmi}
            {...props}
            onLabelsSubmit={(labels) =>
              k8sPatch({
                data: [
                  {
                    op: 'replace',
                    path: '/metadata/labels',
                    value: labels,
                  },
                ],
                model: VirtualMachineInstanceModel,
                resource: vmi,
              })
            }
          />
        ))
      }
      breadcrumb="VirtualMachineInstance.metadata.labels"
      data-test-id={`${vmi?.metadata?.name}-labels`}
      descriptionHeader={t('Labels')}
      isEdit
      isPopover
      moreInfoURL={documentationURL.LABELS}
      showEditOnTitle
    />
  );
};

export default Labels;
