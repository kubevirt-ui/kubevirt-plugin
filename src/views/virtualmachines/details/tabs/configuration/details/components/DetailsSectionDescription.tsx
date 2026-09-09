// Extracted from DetailsSection.tsx
// Root: src/views/virtualmachines/details/tabs/configuration/details/DetailsSection.tsx

import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import {
  type ModalComponentProps,
  useModal,
} from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';

import { updateDescription } from '../utils/utils';

type DetailsSectionDescriptionProps = {
  vm: V1VirtualMachine;
};

const DetailsSectionDescription: FC<DetailsSectionDescriptionProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const vmName = getName(vm);

  return (
    <DescriptionItem
      data-test={`${vmName}-description`}
      descriptionData={
        getAnnotation(vm, DESCRIPTION_ANNOTATION) ?? <MutedTextSpan text={t('None')} />
      }
      descriptionHeader={<SearchItem id="description">{t('Description')}</SearchItem>}
      isEdit
      onEditClick={(): void =>
        createModal(
          ({ isOpen, onClose }: ModalComponentProps): React.JSX.Element => (
            <DescriptionModal
              isOpen={isOpen}
              obj={vm}
              onClose={onClose}
              onSubmit={(description): Promise<V1VirtualMachine> =>
                updateDescription(vm, description)
              }
            />
          ),
        )
      }
    />
  );
};

export default DetailsSectionDescription;
