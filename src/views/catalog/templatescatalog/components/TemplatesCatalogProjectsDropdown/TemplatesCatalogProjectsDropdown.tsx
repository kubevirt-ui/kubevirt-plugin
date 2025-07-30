import React, { FC, memo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Content, ContentVariants } from '@patternfly/react-core';

import './TemplatesCatalogProjectsDropdown.scss';

type TemplatesCatalogProjectsDropdownProps = {
  onChange: (project: string) => void;
  selectedProject: string;
};

export const TemplatesCatalogProjectsDropdown: FC<TemplatesCatalogProjectsDropdownProps> = memo(
  ({ onChange, selectedProject }) => {
    const { t } = useKubevirtTranslation();
    const cluster = useClusterParam();
    const [projects] = useK8sWatchData<K8sResourceCommon[]>({
      cluster,
      groupVersionKind: modelToGroupVersionKind(ProjectModel),
      isList: true,
      namespaced: false,
    });

    const onSelect = (value: string) => {
      onChange(value === ALL_PROJECTS ? '' : value);
    };

    return (
      <div className="templates-catalog-project-dropdown">
        <Content
          className="templates-catalog-project-dropdown-label"
          component={ContentVariants.h6}
        >
          {t('Template project')}
        </Content>
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
