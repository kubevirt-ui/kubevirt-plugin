import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForResource,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, SelectOption } from '@patternfly/react-core';

import FormPFSelect from '../../FormPFSelect/FormPFSelect';

type InstanceTypeModalUserInstanceTypeSelectProps = {
  onSelectName: (name: string) => void;
  selectedInstanceType: InstanceTypeUnion | undefined;
  selectedName: string | undefined;
  userInstanceTypes: InstanceTypeUnion[];
};

const InstanceTypeModalUserInstanceTypeSelect: FC<InstanceTypeModalUserInstanceTypeSelectProps> = ({
  onSelectName,
  selectedInstanceType,
  selectedName,
  userInstanceTypes,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup isRequired label={t('InstanceType')}>
      <FormPFSelect
        onSelect={(_event, value: string): void => onSelectName(value)}
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
        {isEmpty(userInstanceTypes) ? (
          <SelectOption isDisabled>{t('No options found')}</SelectOption>
        ) : (
          userInstanceTypes.map((instanceTypeItem) => {
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
          })
        )}
      </FormPFSelect>
    </FormGroup>
  );
};

export default InstanceTypeModalUserInstanceTypeSelect;
