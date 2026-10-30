import { type FC, type JSX } from 'react';

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
import { getDescription, getName } from '@kubevirt-utils/resources/shared';

import { updateDescription } from '../utils/utils';

type DetailsSectionDescriptionProps = {
  canUpdateVM: boolean;
  vm: V1VirtualMachine;
};

const DetailsSectionDescription: FC<DetailsSectionDescriptionProps> = ({ canUpdateVM, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const vmName = getName(vm);

  return (
    <DescriptionItem
      data-test={`${vmName}-description`}
      //eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      descriptionData={getDescription(vm) || <MutedTextSpan text={t('None')} />} // we don't want to show the empty string
      descriptionHeader={<SearchItem id="description">{t('Description')}</SearchItem>}
      isEdit={canUpdateVM}
      onEditClick={(): void =>
        createModal(
          ({ isOpen, onClose }: ModalComponentProps): JSX.Element => (
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
