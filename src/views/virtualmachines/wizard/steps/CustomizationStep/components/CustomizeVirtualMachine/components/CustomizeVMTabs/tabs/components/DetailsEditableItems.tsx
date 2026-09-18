import React, { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MoveVMToFolderModal from '@kubevirt-utils/components/MoveVMToFolderModal/MoveVMToFolderModal';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getLabel, getName } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION, getHostname } from '@kubevirt-utils/resources/vm';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { useSyncDeploymentDetailsAndMetadataFields } from '@virtualmachines/wizard/hooks/useSyncDeploymentDetailsAndMetadataFields';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { patchWizardCustomizedVM } from '@virtualmachines/wizard/utils/patchWizardCustomizedVM';

type DetailsEditableItemsProps = {
  treeViewFoldersEnabled: boolean;
};

const DetailsEditableItems: FC<DetailsEditableItemsProps> = ({ treeViewFoldersEnabled }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { getValues, setValue } = useVMWizard();
  const { syncDescriptionFieldAndMetadataAnnotations, syncFolderFieldAndMetadataLabels } =
    useSyncDeploymentDetailsAndMetadataFields();

  const { control } = useVMWizard();
  const vm = useWatch({ control, name: CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM });
  const vmName = getName(vm);

  return (
    <>
      <DescriptionItem
        data-test={`${vmName}-description`}
        descriptionData={
          getAnnotation(vm, DESCRIPTION_ANNOTATION) ?? <MutedTextSpan text={t('None')} />
        }
        descriptionHeader={<SearchItem id="description">{t('Description')}</SearchItem>}
        isEdit
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <DescriptionModal
              isOpen={isOpen}
              obj={vm}
              onClose={onClose}
              onSubmit={(description) =>
                Promise.resolve(syncDescriptionFieldAndMetadataAnnotations(description))
              }
            />
          ))
        }
      />
      {treeViewFoldersEnabled && (
        <DescriptionItem
          data-test={`${vmName}-folder`}
          descriptionData={getLabel(vm, VM_FOLDER_LABEL)}
          descriptionHeader={<SearchItem id="folder">{t('Group')}</SearchItem>}
          isEdit
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <MoveVMToFolderModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={(folderName) =>
                  Promise.resolve(syncFolderFieldAndMetadataLabels(folderName))
                }
                vm={vm}
              />
            ))
          }
        />
      )}
      <DescriptionItem
        data-test={`${vmName}-hostname`}
        descriptionData={getHostname(vm) || vmName}
        descriptionHeader={<SearchItem id="hostname">{t('Hostname')}</SearchItem>}
        isEdit
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <HostnameModal
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={(updatedVM) => {
                const hostnamePatch = [
                  { data: getHostname(updatedVM), path: `spec.template.spec.hostname` },
                ];
                return Promise.resolve(patchWizardCustomizedVM(getValues, setValue, hostnamePatch));
              }}
              vm={vm}
            />
          ))
        }
      />
    </>
  );
};

export default DetailsEditableItems;
