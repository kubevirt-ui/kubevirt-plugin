import React, { FC, memo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Text, TextVariants } from '@patternfly/react-core';

import './TemplatesCatalogProjectsDropdown.scss';

type TemplatesCatalogProjectsDropdownProps = {
  onChange: (project: string) => void;
  selectedProject: string;
};

export const TemplatesCatalogProjectsDropdown: FC<TemplatesCatalogProjectsDropdownProps> = memo(
  ({ onChange, selectedProject }) => {
    const { t } = useKubevirtTranslation();
    const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
      groupVersionKind: modelToGroupVersionKind(ProjectModel),
      isList: true,
      namespaced: false,
    });

    const onSelect = (value: string) => {
      onChange(value === ALL_PROJECTS ? '' : value);
    };

    return (
      <div className="templates-catalog-project-dropdown">
        <Text className="templates-catalog-project-dropdown-label" component={TextVariants.h6}>
          {t('Template project')}
        </Text>
        <InlineFilterSelect
          options={[
            { children: ALL_PROJECTS, value: ALL_PROJECTS },
            ...projects
              .sort((a, b) => getName(a).localeCompare(getName(b)))
              .map((proj) => {
                const name = getName(proj);
                return { children: name, value: name };
              }),
          ]}
          selected={selectedProject || ALL_PROJECTS}
          setSelected={onSelect}
          toggleProps={{ isFullWidth: true }}
        />
      </div>
    );
  },
);

TemplatesCatalogProjectsDropdown.displayName = 'TemplatesCatalogProjectsDropdown';
