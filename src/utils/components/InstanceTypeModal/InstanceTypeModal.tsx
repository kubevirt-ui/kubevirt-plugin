import { type FC } from 'react';
import isEqual from 'lodash/isEqual';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { getCluster } from '@multicluster/helpers/selectors';

import TabModal from '../TabModal/TabModal';
import InstanceTypeModalRedHatSeriesFields from './components/InstanceTypeModalRedHatSeriesFields';
import InstanceTypeModalUserInstanceTypeSelect from './components/InstanceTypeModalUserInstanceTypeSelect';
import InstanceTypeProviderRadios from './components/InstanceTypeProviderRadios';
import useEditInstanceType from './hooks/useEditInstanceType';
import useVisibleInstanceTypeSeriesEntries from './hooks/useVisibleInstanceTypeSeriesEntries';
import { type InstanceTypeModalProps } from './utils/types';

const InstanceTypeModal: FC<InstanceTypeModalProps> = ({
  allInstanceTypes,
  instanceType,
  isOpen,
  onClose,
  onSubmit,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const {
    mappedInstanceTypes,
    redHatProvided,
    selectedInstanceType,
    selectedName,
    series,
    setRedHatProvided,
    setSelectedName,
    setSeries,
    setSize,
    size,
    userInstanceTypes,
  } = useEditInstanceType({ allInstanceTypes, instanceType });

  const visibleSeriesEntries = useVisibleInstanceTypeSeriesEntries({
    cluster: getCluster(vm),
    instanceTypeName: getName(instanceType),
    mappedInstanceTypes,
  });

  const handleSubmit = (newInstanceType: InstanceTypeUnion): Promise<V1VirtualMachine> =>
    onSubmit(vm, newInstanceType);

  return (
    <TabModal
      headerText={t('Edit InstanceType')}
      isDisabled={!selectedInstanceType || isEqual(selectedInstanceType, instanceType)}
      isOpen={isOpen}
      obj={selectedInstanceType}
      onClose={onClose}
      onSubmit={handleSubmit}
      shouldWrapInForm
      submitDisabledTooltip={
        !selectedInstanceType ? t('Select an instance type') : getNoModalChangesTooltip(t)
      }
    >
      <InstanceTypeProviderRadios
        redHatProvided={redHatProvided}
        setRedHatProvided={setRedHatProvided}
      />
      {redHatProvided && (
        <InstanceTypeModalRedHatSeriesFields
          mappedInstanceTypes={mappedInstanceTypes}
          series={series}
          setSeries={setSeries}
          setSize={setSize}
          size={size}
          visibleSeriesEntries={visibleSeriesEntries}
        />
      )}
      {!redHatProvided && (
        <InstanceTypeModalUserInstanceTypeSelect
          onSelectName={setSelectedName}
          selectedInstanceType={selectedInstanceType}
          selectedName={selectedName}
          userInstanceTypes={userInstanceTypes}
        />
      )}
    </TabModal>
  );
};

export default InstanceTypeModal;
