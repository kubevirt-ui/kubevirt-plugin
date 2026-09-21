import { type FC, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useCanCreateResource from '@kubevirt-utils/hooks/useCanCreateResource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import TabModal from '../TabModal/TabModal';
import SysprepModalBody from './components/SysprepModalBody/SysprepModalBody';
import { type SysprepModalProps, SysprepSelectionOption } from './types';
import {
  getInitialSysprepSelection,
  isSysprepSubmitDisabled,
  resolveSysprepSelection,
} from './utils';

export const SysprepModal: FC<SysprepModalProps> = ({
  cluster,
  isOpen,
  namespace,
  onClose,
  onSysprepCreation,
  onSysprepSelected,
  sysprepSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const canCreateConfigMap = useCanCreateResource({
    cluster,
    model: ConfigMapModel,
    namespace,
  });
  const [autoUnattend, setAutoUnattend] = useState<string>('');
  const [unattend, setUnattend] = useState<string>('');
  const [selectionOption, setSelectionOption] = useState<SysprepSelectionOption>(() =>
    getInitialSysprepSelection(sysprepSelected),
  );
  const [selectedSysprepName, setSelectedSysprepName] = useState(sysprepSelected ?? '');
  const resolvedSelectionOption = resolveSysprepSelection(
    selectionOption,
    sysprepSelected,
    canCreateConfigMap,
  );

  const submitHandler = async (): Promise<void> => {
    if (resolvedSelectionOption === SysprepSelectionOption.CreateNew && canCreateConfigMap) {
      return await onSysprepCreation(unattend, autoUnattend);
    }

    await onSysprepSelected(
      resolvedSelectionOption === SysprepSelectionOption.None ? '' : selectedSysprepName,
    );
  };

  const isSubmitDisabled = isSysprepSubmitDisabled({
    autoUnattend,
    canCreateConfigMap,
    initialSysprepSelected: sysprepSelected,
    selectedSysprepName,
    selectionOption: resolvedSelectionOption,
    unattend,
  });

  return (
    <TabModal
      headerText={t('Sysprep')}
      isDisabled={isSubmitDisabled}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => submitHandler()}
    >
      <MutedTextSpan text={t('Sysprep is saved in the project as a config map')} />
      <SysprepModalBody
        autoUnattend={autoUnattend}
        canCreateConfigMap={canCreateConfigMap}
        cluster={cluster}
        namespace={namespace}
        selectedSysprepName={selectedSysprepName}
        selectionOption={resolvedSelectionOption}
        setAutoUnattend={setAutoUnattend}
        setSelectedSysprepName={setSelectedSysprepName}
        setSelectionOption={setSelectionOption}
        setUnattend={setUnattend}
        unattend={unattend}
      />
    </TabModal>
  );
};
