import React, { FC, memo, useMemo } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import './TemplatesCatalogNamespacesDropdown.scss';

type TemplatesCatalogNamespacesDropdownProps = {
  onChange: (namespace: string) => void;
  selectedNamespace: string;
};

export const TemplatesCatalogNamespacesDropdown: FC<TemplatesCatalogNamespacesDropdownProps> = memo(
  ({ onChange, selectedNamespace }) => {
    const cluster = useClusterParam();
    const [namespaces] = useK8sWatchData<K8sResourceCommon[]>({
      cluster,
      groupVersionKind: modelToGroupVersionKind(NamespaceModel),
      isList: true,
      namespaced: false,
    });

    const options = useMemo(
      () => [
        { children: ALL_NAMESPACES, value: ALL_NAMESPACES },
        ...[...namespaces]
          .sort((a, b) => getName(a).localeCompare(getName(b)))
          .map((ns) => {
            const name = getName(ns);
            return { children: name, value: name };
          }),
      ],
      [namespaces],
    );

    const onSelect = (value: string) => {
      onChange(value === ALL_NAMESPACES ? '' : value);
    };

    return (
      <div className="templates-catalog-namespace-dropdown">
        <InlineFilterSelect
          options={options}
          selected={selectedNamespace || ALL_NAMESPACES}
          setSelected={onSelect}
          toggleProps={{ isFullWidth: true }}
        />
      </div>
    );
  },
);

TemplatesCatalogNamespacesDropdown.displayName = 'TemplatesCatalogNamespacesDropdown';
