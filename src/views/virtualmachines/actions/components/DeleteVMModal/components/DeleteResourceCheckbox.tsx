import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, Label, StackItem } from '@patternfly/react-core';

import { getResourceModel, sameResource } from '../utils/helpers';

type DeleteResourceCheckboxProps = {
  isShared?: boolean;

  resource: K8sResourceCommon;
  resourcesToSave: K8sResourceCommon[];
  setResourcesToSave: Dispatch<SetStateAction<K8sResourceCommon[]>>;
};

const DeleteResourceCheckbox: FC<DeleteResourceCheckboxProps> = ({
  isShared,
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
        label={
          <>
            {t('Delete disk')}{' '}
            <ResourceIcon groupVersionKind={modelToGroupVersionKind(getResourceModel(resource))} />{' '}
            {resourceName}
            {isShared ? <Label>Shared</Label> : undefined}
          </>
        }
        id={`${resource.kind}-${resourceName}`}
        isChecked={!resourcesToSave.find((volume) => sameResource(volume, resource))}
        onChange={(_, checked: boolean) => (checked ? deleteResource() : saveResource())}
      />
    </StackItem>
  );
};

export default DeleteResourceCheckbox;
