import React, { FC, memo, useEffect, useState } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ContextSelector, ContextSelectorItem, Text, TextVariants } from '@patternfly/react-core';

import './TemplatesCatalogProjectsDropdown.scss';

type TemplatesCatalogProjectsDropdownProps = {
  selectedProject: string;
  onChange: (project: string) => void;
};

const ALL_PROJECTS_SELECTOR = 'All projects';

export const TemplatesCatalogProjectsDropdown: FC<TemplatesCatalogProjectsDropdownProps> = memo(
  ({ selectedProject, onChange }) => {
    const { t } = useKubevirtTranslation();
    const [isOpen, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filteredProjects, setFilteredProjects] = useState<K8sResourceCommon[]>([]);
    const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
      groupVersionKind: modelToGroupVersionKind(ProjectModel),
      namespaced: false,
      isList: true,
    });

    const onSelect = (event: any, value: string) => {
      onChange(value === ALL_PROJECTS_SELECTOR ? '' : value);
      setOpen(!isOpen);
    };

    const onSearchInputChange = (value: string) => {
      setSearchValue(value);
      const filtered =
        value === ''
          ? projects
          : projects.filter((project) => project.metadata.name.includes(value));

      setFilteredProjects(filtered || []);
    };

    useEffect(() => {
      if (filteredProjects.length === 0 && searchValue === '') {
        setFilteredProjects(projects);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projects]);

    return (
      <div className="templates-catalog-project-dropdown">
        <Text component={TextVariants.h6} className="templates-catalog-project-dropdown-label">
          {t('Template project')}
        </Text>
        <ContextSelector
          className=""
          toggleText={selectedProject || ALL_PROJECTS_SELECTOR}
          isOpen={isOpen}
          searchInputValue={searchValue}
          onToggle={() => setOpen(!isOpen)}
          onSelect={onSelect}
          onSearchInputChange={onSearchInputChange}
          screenReaderLabel="Selected Project:"
          searchInputPlaceholder={t('Search')}
          isPlain
          isText
        >
          <>
            {!searchValue && (
              <ContextSelectorItem key="all-namespaces">
                {ALL_PROJECTS_SELECTOR}
              </ContextSelectorItem>
            )}
            {filteredProjects
              .sort((a, b) => a.metadata.name.localeCompare(b.metadata.name))
              .map((item) => (
                <ContextSelectorItem key={item.metadata.name}>
                  {item.metadata.name}
                </ContextSelectorItem>
              ))}
          </>
        </ContextSelector>
      </div>
    );
  },
);

TemplatesCatalogProjectsDropdown.displayName = 'TemplatesCatalogProjectsDropdown';
