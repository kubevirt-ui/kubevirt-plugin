import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, StackItem } from '@patternfly/react-core';

import { sameResource } from '../utils/helpers';

type DeleteResourceCheckboxProps = {
  resource: K8sResourceCommon;

  resourcesToSave: K8sResourceCommon[];
  setResourcesToSave: Dispatch<SetStateAction<K8sResourceCommon[]>>;
};

const DeleteResourceCheckbox: FC<DeleteResourceCheckboxProps> = ({
  resource,
  resourcesToSave,
  setResourcesToSave,
}) => {
  const { t } = useKubevirtTranslation();
  const resourceName = getName(resource);

  const saveResource = () => setResourcesToSave((prevVolumes) => [...prevVolumes, resource]);

  const deleteResource = () =>
    setResourcesToSave((prevVolumes) =>
      prevVolumes.filter((volume) => !sameResource(volume, resource)),
    );

  return (
    <StackItem>
      <Checkbox
        label={t('Delete disk {{resourceName}} ({{kindAbbr}})', {
          kindAbbr: resource.kind,
          resourceName,
        })}
        id={`${resource.kind}-${resourceName}`}
        isChecked={!resourcesToSave.find((volume) => sameResource(volume, resource))}
        onChange={(_, checked: boolean) => (checked ? deleteResource() : saveResource())}
      />
    </StackItem>
  );
};

export default DeleteResourceCheckbox;
