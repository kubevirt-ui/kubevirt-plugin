import React, { FC, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { Content, Flex, FlexItem, SelectList, SelectOption } from '@patternfly/react-core';

import FormPFSelect from '../FormPFSelect/FormPFSelect';
import TabModal from '../TabModal/TabModal';

import { InstanceTypeModalProps } from './utils/types';
import {
  getInstanceTypeFromSeriesAndSize,
  getInstanceTypeSeriesAndSize,
  getInstanceTypeSeriesDisplayName,
  getInstanceTypeSizes,
  getInstanceTypesPrettyDisplaySize,
  mappedInstanceTypesToSelectOptions,
} from './utils/util';

const InstanceTypeModal: FC<InstanceTypeModalProps> = ({
  allInstanceTypes,
  instanceType,
  isOpen,
  onClose,
  onSubmit,
  vm,
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

  const [series, setSeries] = useState<string | undefined>(
    getInstanceTypeSeriesDisplayName(mappedInstanceTypes, instanceTypeSeries),
  );

  const [size, setSize] = useState<string | undefined>(
    getInstanceTypesPrettyDisplaySize(mappedInstanceTypes, instanceTypeSeries, instanceTypeSize),
  );

  const handleSubmit = (selectedInstanceType: InstanceTypeUnion) =>
    onSubmit(vm, selectedInstanceType);

  return (
    <TabModal
      headerText={t('Edit Instance Type')}
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
          <Content component="h5">{t('Series')}</Content>
          <FormPFSelect
            onSelect={(_, value) => {
              if (value !== series) {
                setSeries(value as string);
                setSize(undefined);
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
          <Content component="h5">{t('Size')}</Content>
          <FormPFSelect
            onSelect={(_, value) => {
              setSize(value as string);
            }}
            selected={size}
            toggleProps={{ isFullWidth: true }}
          >
            {getInstanceTypeSizes(mappedInstanceTypes, series)?.map((item) => (
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
