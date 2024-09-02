import React, { FC, useMemo, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, FlexItem, SelectList, SelectOption, Text } from '@patternfly/react-core';
import { InstanceTypeUnion } from '@virtualmachines/details/tabs/configuration/utils/types';

import FormPFSelect from '../FormPFSelect/FormPFSelect';
import TabModal from '../TabModal/TabModal';

import {
  getInstanceTypeFromSeriesAndSize,
  getInstanceTypeSeriesAndSize,
  getInstanceTypeSeriesDisplayName,
  getInstanceTypesPrettyDisplaySize,
  getInstanceTypesSizes,
  mappedInstanceTypesToSelectOptions,
} from './utils/util';

type InstanceTypeModalProps = {
  allInstanceTypes: InstanceTypeUnion[];
  instanceType: InstanceTypeUnion;
  instanceTypeVM: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    updatedVM: V1VirtualMachine,
    instanceType: InstanceTypeUnion,
  ) => Promise<V1VirtualMachine>;
};

const InstanceTypeModal: FC<InstanceTypeModalProps> = ({
  allInstanceTypes,
  instanceType,
  instanceTypeVM,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const mappedInstanceTypes = useMemo(
    () => mappedInstanceTypesToSelectOptions(allInstanceTypes),
    [allInstanceTypes],
  );
  const { series: instanceTypeSeries, size: instanceTypeSize } = useMemo(
    () => getInstanceTypeSeriesAndSize(instanceType),
    [instanceType],
  );

  const [series, setSeries] = useState<string>(
    getInstanceTypeSeriesDisplayName(mappedInstanceTypes, instanceTypeSeries),
  );

  const [size, setSize] = useState<string>(
    getInstanceTypesPrettyDisplaySize(mappedInstanceTypes, instanceTypeSeries, instanceTypeSize),
  );

  const handleSubmit = (selectedInstanceType: InstanceTypeUnion) =>
    onSubmit(instanceTypeVM, selectedInstanceType);

  return (
    <TabModal
      headerText={t('Edit Instancetype')}
      isOpen={isOpen}
      obj={getInstanceTypeFromSeriesAndSize(mappedInstanceTypes, series, size)}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <Flex
        spaceItems={{
          default: 'spaceItemsXl',
        }}
        direction={{ default: 'column' }}
        spacer={{ default: 'spacer4xl' }}
      >
        <FlexItem>
          <Text component="h5">{t('Series')}</Text>
          <FormPFSelect
            onSelect={(_, value) => {
              if (value !== series) {
                setSeries(value as string);
                setSize(null);
              }
            }}
            selected={series}
            toggleProps={{ isFullWidth: true }}
          >
            <SelectList>
              {Object.entries(mappedInstanceTypes).map(([key, value]) => (
                <SelectOption
                  description={value.descriptionSeries}
                  key={key}
                  value={value.displayNameSeries}
                >
                  {value.displayNameSeries}
                </SelectOption>
              ))}
            </SelectList>
          </FormPFSelect>
        </FlexItem>
        <FlexItem>
          <Text component="h5">{t('Size')}</Text>
          <FormPFSelect
            onSelect={(_, value) => {
              setSize(value as string);
            }}
            selected={size}
            toggleProps={{ isFullWidth: true }}
          >
            {getInstanceTypesSizes(mappedInstanceTypes, series)?.map((item) => (
              <SelectOption key={item.prettyDisplaySize} value={item.prettyDisplaySize}>
                {item?.prettyDisplaySize}
              </SelectOption>
            ))}
          </FormPFSelect>
        </FlexItem>
      </Flex>
    </TabModal>
  );
};

export default InstanceTypeModal;
