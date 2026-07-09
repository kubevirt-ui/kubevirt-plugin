import React, { FC } from 'react';

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
  patchCustomizeWizardVMSignal,
  vmSignal,
} from '@kubevirt-utils/store/customizeInstanceType';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

type DetailsEditableItemsProps = {
  treeViewFoldersEnabled: boolean;
};

const DetailsEditableItems: FC<DetailsEditableItemsProps> = ({ treeViewFoldersEnabled }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const vm = vmSignal.value;
  const vmName = getName(vm);

  return (
    <>
      <DescriptionItem
        descriptionData={
          getAnnotation(vm, DESCRIPTION_ANNOTATION) || <MutedTextSpan text={t('None')} />
        }
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <DescriptionModal
              onSubmit={(description) =>
                Promise.resolve(
                  patchCustomizeWizardVMSignal([
                    { data: description, path: `metadata.annotations.${DESCRIPTION_ANNOTATION}` },
                  ]),
                )
              }
              isOpen={isOpen}
              obj={vm}
              onClose={onClose}
            />
          ))
        }
        data-test-id={`${vmName}-description`}
        descriptionHeader={<SearchItem id="description">{t('Description')}</SearchItem>}
        isEdit
      />
      {treeViewFoldersEnabled && (
        <DescriptionItem
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <MoveVMToFolderModal
                onSubmit={(folderName) =>
                  Promise.resolve(
                    patchCustomizeWizardVMSignal([
                      { data: folderName, path: ['metadata', 'labels', VM_FOLDER_LABEL] },
                    ]),
                  )
                }
                isOpen={isOpen}
                onClose={onClose}
                vm={vm}
              />
            ))
          }
          data-test-id={`${vmName}-folder`}
          descriptionData={getLabel(vm, VM_FOLDER_LABEL)}
          descriptionHeader={<SearchItem id="folder">{t('Folder')}</SearchItem>}
          isEdit
        />
      )}
      <DescriptionItem
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <HostnameModal
              onSubmit={(updatedVM) =>
                Promise.resolve(
                  patchCustomizeWizardVMSignal([
                    { data: getHostname(updatedVM), path: `spec.template.spec.hostname` },
                  ]),
                )
              }
              isOpen={isOpen}
              onClose={onClose}
              vm={vm}
            />
          ))
        }
        data-test-id={`${vmName}-hostname`}
        descriptionData={getHostname(vm) || vmName}
        descriptionHeader={<SearchItem id="hostname">{t('Hostname')}</SearchItem>}
        isEdit
      />
    </>
  );
};

export default DetailsEditableItems;
