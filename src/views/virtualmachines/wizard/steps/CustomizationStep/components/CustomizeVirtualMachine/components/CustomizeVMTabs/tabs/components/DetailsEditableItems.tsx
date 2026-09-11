import React, { type FC } from 'react';

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
import {
  customizeWizardVMSignal,
  patchCustomizeWizardVMSignal,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

type DetailsEditableItemsProps = {
  treeViewFoldersEnabled: boolean;
};

const DetailsEditableItems: FC<DetailsEditableItemsProps> = ({ treeViewFoldersEnabled }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const vm = customizeWizardVMSignal.value;
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
                Promise.resolve(
                  patchCustomizeWizardVMSignal([
                    { data: description, path: `metadata.annotations.${DESCRIPTION_ANNOTATION}` },
                  ]),
                )
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
                  Promise.resolve(
                    patchCustomizeWizardVMSignal([
                      { data: folderName, path: ['metadata', 'labels', VM_FOLDER_LABEL] },
                    ]),
                  )
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
              onSubmit={(updatedVM) =>
                Promise.resolve(
                  patchCustomizeWizardVMSignal([
                    { data: getHostname(updatedVM), path: `spec.template.spec.hostname` },
                  ]),
                )
              }
              vm={vm}
            />
          ))
        }
      />
    </>
  );
};

export default DetailsEditableItems;
