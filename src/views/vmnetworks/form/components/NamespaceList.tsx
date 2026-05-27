import React, { FC, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { NAMESPACE_NAME_LABEL_KEY } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, MatchExpression } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Skeleton, Stack } from '@patternfly/react-core';

import { VMNetworkForm } from '../constants';

import SelectedNamespaces from './SelectedNamespaces';

type NamespaceListProps = {
  errorLoadingNamespaces: Error;
  loadedNamespaces: boolean;
  namespaces: K8sResourceCommon[];
};

const NamespaceList: FC<NamespaceListProps> = ({ errorLoadingNamespaces, loadedNamespaces, namespaces }) => {
  const { t } = useKubevirtTranslation();
  const { control, watch } = useFormContext<VMNetworkForm>();

  const matchExpressions = watch('network.spec.namespaceSelector.matchExpressions');

  const transformNamespacesIntoMatchExpressions = useCallback(
    (selected: string[]): MatchExpression[] => [
      {
        key: NAMESPACE_NAME_LABEL_KEY,
        operator: 'In',
        values: selected,
      },
    ],
    [],
  );

  if (!loadedNamespaces) return <Skeleton />;

  if (errorLoadingNamespaces)
    return (
      <Alert isInline title={t('Failed to retrieve the list of namespaces')} variant="danger">
        {errorLoadingNamespaces?.message ?? ''}
      </Alert>
    );

  return (
    <Stack className="pf-v6-u-pl-md" hasGutter>
      <Controller
        render={({ field: { onChange, value } }) => (
          <MultiSelectTypeahead
            setSelectedResourceNames={(newSelection) => {
              onChange(transformNamespacesIntoMatchExpressions(newSelection));
            }}
            allResourceNames={namespaces.map(getName)}
            hasCheckboxes
            selectedResourceNames={value?.map((expr) => expr.values).flat() || []}
          />
        )}
        control={control}
        name="network.spec.namespaceSelector.matchExpressions"
      />
      {matchExpressions?.length > 0 && <SelectedNamespaces />}
    </Stack>
  );
};

export default NamespaceList;
