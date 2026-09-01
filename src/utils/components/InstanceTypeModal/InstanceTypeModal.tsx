import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getGroupVersionKindForResource,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, SelectOption } from '@patternfly/react-core';

import FormPFSelect from '../FormPFSelect/FormPFSelect';
import TabModal from '../TabModal/TabModal';
import InstanceTypeProviderRadios from './components/InstanceTypeProviderRadios';
import useEditInstanceType from './hooks/useEditInstanceType';
import { type InstanceTypeModalProps } from './utils/types';
import { getInstanceTypeSizes } from './utils/util';

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

  const handleSubmit = (newInstanceType: InstanceTypeUnion): Promise<V1VirtualMachine> =>
    onSubmit(vm, newInstanceType);

  return (
    <TabModal
      headerText={t('Edit InstanceType')}
      isDisabled={!selectedInstanceType}
      isOpen={isOpen}
      obj={selectedInstanceType}
      onClose={onClose}
      onSubmit={handleSubmit}
      shouldWrapInForm
    >
      <InstanceTypeProviderRadios
        redHatProvided={redHatProvided}
        setRedHatProvided={setRedHatProvided}
      />
      {redHatProvided && (
        <>
          <FormGroup isRequired label={t('Series')}>
            <FormPFSelect
              onSelect={(_event, value): void => {
                if (value !== series) {
                  setSeries(value as string);
                  setSize(undefined);
                }
              }}
              placeholder={t('Select series')}
              selected={series}
              toggleProps={{ isFullWidth: true }}
            >
              {Object.entries(mappedInstanceTypes).map(([key, value]) => (
                <SelectOption
                  description={value.descriptionSeries}
                  key={key}
                  value={value.displayNameSeries}
                >
                  {value.displayNameSeries}
                </SelectOption>
              ))}
            </FormPFSelect>
          </FormGroup>
          <FormGroup isRequired label={t('Size')}>
            <FormPFSelect
              onSelect={(_event, value): void => {
                setSize(value as string);
              }}
              placeholder={t('Select size')}
              selected={size}
              toggleProps={{ isFullWidth: true }}
            >
              {getInstanceTypeSizes(mappedInstanceTypes, series)?.map((item) => (
                <SelectOption key={item.prettyDisplaySize} value={item.prettyDisplaySize}>
                  {item?.prettyDisplaySize}
                </SelectOption>
              ))}
            </FormPFSelect>
          </FormGroup>
        </>
      )}
      {!redHatProvided && (
        <FormGroup isRequired label={t('InstanceType')}>
          <FormPFSelect
            onSelect={(_event, value: string): void => setSelectedName(value)}
            placeholder={t('Select InstanceType')}
            selected={selectedName}
            selectedLabel={
              selectedName && selectedInstanceType ? (
                <ResourceLink
                  groupVersionKind={getGroupVersionKindForResource(selectedInstanceType)}
                  linkTo={false}
                  name={selectedName}
                />
              ) : undefined
            }
            toggleProps={{ isFullWidth: true }}
          >
            {userInstanceTypes.map((instanceTypeItem) => {
              const instanceTypeName = getName(instanceTypeItem);
              return (
                <SelectOption key={instanceTypeName} value={instanceTypeName}>
                  <ResourceLink
                    groupVersionKind={getGroupVersionKindForResource(instanceTypeItem)}
                    linkTo={false}
                    name={instanceTypeName}
                  />
                </SelectOption>
              );
            })}
          </FormPFSelect>
        </FormGroup>
      )}
    </TabModal>
  );
};

export default InstanceTypeModal;
