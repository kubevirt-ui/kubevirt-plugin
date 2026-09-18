import { type FC, useEffect, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useCanCreateResource from '@kubevirt-utils/hooks/useCanCreateResource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import TabModal from '../TabModal/TabModal';
import SysprepModalBody from './components/SysprepModalBody/SysprepModalBody';
import { type SysprepModalProps, SysprepSelectionOption } from './types';
import { getInitialSysprepSelection, isSysprepSubmitDisabled } from './utils';

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

  useEffect(() => {
    if (!canCreateConfigMap && selectionOption === SysprepSelectionOption.CreateNew) {
      setSelectionOption(getInitialSysprepSelection(sysprepSelected));
    }
  }, [canCreateConfigMap, selectionOption, sysprepSelected]);

  const submitHandler = async (): Promise<void> => {
    if (selectionOption === SysprepSelectionOption.CreateNew && canCreateConfigMap) {
      return await onSysprepCreation(unattend, autoUnattend);
    }

    await onSysprepSelected(
      selectionOption === SysprepSelectionOption.None ? '' : selectedSysprepName,
    );
  };

  const isSubmitDisabled = isSysprepSubmitDisabled({
    autoUnattend,
    canCreateConfigMap,
    initialSysprepSelected: sysprepSelected,
    selectedSysprepName,
    selectionOption,
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
        selectionOption={selectionOption}
        setAutoUnattend={setAutoUnattend}
        setSelectedSysprepName={setSelectedSysprepName}
        setSelectionOption={setSelectionOption}
        setUnattend={setUnattend}
        unattend={unattend}
      />
    </TabModal>
  );
};
