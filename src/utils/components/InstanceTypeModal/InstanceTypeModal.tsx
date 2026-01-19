import React, { FC } from 'react';

import { groupVersionKindFromCommonResource } from '@catalog/CreateFromInstanceTypes/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Radio, SelectOption } from '@patternfly/react-core';
import { RedhatIcon, UserIcon } from '@patternfly/react-icons';

import FormPFSelect from '../FormPFSelect/FormPFSelect';
import TabModal from '../TabModal/TabModal';

import useEditInstanceType from './hooks/useEditInstanceType';
import { InstanceTypeModalProps } from './utils/types';
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

  const handleSubmit = (newInstanceType: InstanceTypeUnion) => onSubmit(vm, newInstanceType);

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
      <FormGroup isStack role="radiogroup">
        <Radio
          label={
            <span>
              <RedhatIcon className="pf-v6-u-mr-sm" />
              {t('Red Hat provided')}
            </span>
          }
          id="red-hat-provided"
          isChecked={redHatProvided}
          name="instance-type-provider"
          onChange={() => setRedHatProvided(true)}
        />
        <Radio
          label={
            <span>
              <UserIcon className="pf-v6-u-mr-sm" />
              {t('User provided')}
            </span>
          }
          id="user-provided"
          isChecked={!redHatProvided}
          name="instance-type-provider"
          onChange={() => setRedHatProvided(false)}
        />
      </FormGroup>
      {redHatProvided && (
        <>
          <FormGroup isRequired label={t('Series')}>
            <FormPFSelect
              onSelect={(_, value) => {
                if (value !== series) {
                  setSeries(value as string);
                  setSize(undefined);
                }
              }}
              selected={series}
              toggleProps={{ isFullWidth: true, placeholder: t('Select series') }}
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
              onSelect={(_, value) => {
                setSize(value as string);
              }}
              selected={size}
              toggleProps={{ isFullWidth: true, placeholder: t('Select size') }}
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
            selectedLabel={
              selectedName && selectedInstanceType ? (
                <ResourceLink
                  groupVersionKind={groupVersionKindFromCommonResource(selectedInstanceType)}
                  linkTo={false}
                  name={selectedName}
                />
              ) : undefined
            }
            onSelect={(_, value: string) => setSelectedName(value)}
            selected={selectedName}
            toggleProps={{ isFullWidth: true, placeholder: t('Select InstanceType') }}
          >
            {userInstanceTypes.map((it) => {
              const itName = getName(it);
              return (
                <SelectOption key={itName} value={itName}>
                  <ResourceLink
                    groupVersionKind={groupVersionKindFromCommonResource(it)}
                    linkTo={false}
                    name={itName}
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
