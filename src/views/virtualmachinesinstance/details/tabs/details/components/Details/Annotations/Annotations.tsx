import React, { FC } from 'react';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

type AnnotationsProps = {
  vmi: V1VirtualMachineInstance;
};

const Annotations: FC<AnnotationsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  return (
    <VirtualMachineDescriptionItem
      // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L32
      bodyContent={t(
        'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. ',
      )}
      descriptionData={t('{{annotations}} Annotations', {
        annotations: Object.keys(vmi?.metadata?.annotations || {}).length,
      })}
      onEditClick={() =>
        createModal((props) => (
          <AnnotationsModal
            obj={vmi}
            {...props}
            onSubmit={(annotations) =>
              k8sPatch({
                data: [
                  {
                    op: 'replace',
                    path: '/metadata/annotaions',
                    value: annotations,
                  },
                ],
                model: VirtualMachineInstanceModel,
                resource: vmi,
              })
            }
          />
        ))
      }
      breadcrumb="VirtualMachineInstance.metadata.annotations"
      descriptionHeader={t('Annotations')}
      isEdit
      isPopover
      moreInfoURL={documentationURL.ANNOTATIONS}
    />
  );
};

export default Annotations;
