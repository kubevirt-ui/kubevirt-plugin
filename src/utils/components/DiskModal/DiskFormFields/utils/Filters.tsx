import * as React from 'react';
import { TFunction } from 'i18next';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { StorageClassModel } from '@kubevirt-utils/models';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { SelectOption } from '@patternfly/react-core';

import { isDefaultStorageClass } from './helpers';

export const FilterPVCSelect = (options: string[]) => {
  return (_, value: string): React.ReactElement[] => {
    let newOptions = options;

    if (value) {
      const regex = new RegExp(value, 'i');
      newOptions = options.filter((namespace) => regex.test(namespace));
    }

    return newOptions.map((namespace) => (
      <SelectOption key={namespace} value={namespace} />
    )) as React.ReactElement[];
  };
};

export const getSCSelectOptions = (
  storageClasses: IoK8sApiStorageV1StorageClass[],
  t: TFunction,
): React.ReactElement[] => {
  return storageClasses?.map((sc) => {
    const scName = sc?.metadata?.name;
    const defaultSC = isDefaultStorageClass(sc) ? t('(default) | ') : '';
    const descriptionAnnotation = sc?.metadata?.annotations?.['description']?.concat(' | ') || '';
    const scType = sc?.parameters?.type ? ' | '.concat(sc?.parameters?.type) : '';
    const optionDescription = `${defaultSC}${descriptionAnnotation}${sc?.provisioner}${scType}`;
    return (
      <SelectOption key={scName} value={scName} description={optionDescription}>
        <ResourceLink kind={StorageClassModel.kind} name={scName} linkTo={false} />
      </SelectOption>
    );
  });
};

export const FilterSCSelect = (options: IoK8sApiStorageV1StorageClass[], t: TFunction) => {
  return (_, value: string): React.ReactElement[] => {
    let newOptions = options;

    if (value) {
      const regex = new RegExp(value, 'i');
      newOptions = options.filter((sc) => regex.test(sc.metadata.name));
    }

    return getSCSelectOptions(newOptions, t);
  };
};
