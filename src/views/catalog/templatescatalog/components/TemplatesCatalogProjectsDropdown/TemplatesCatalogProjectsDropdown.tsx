import React, { FC, memo, useEffect, useState } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ContextSelector, ContextSelectorItem, Text, TextVariants } from '@patternfly/react-core';

import './TemplatesCatalogProjectsDropdown.scss';

type TemplatesCatalogProjectsDropdownProps = {
  onChange: (project: string) => void;
  selectedProject: string;
};

const ALL_PROJECTS_SELECTOR = 'All projects';

export const TemplatesCatalogProjectsDropdown: FC<TemplatesCatalogProjectsDropdownProps> = memo(
  ({ onChange, selectedProject }) => {
    const { t } = useKubevirtTranslation();
    const [isOpen, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filteredProjects, setFilteredProjects] = useState<K8sResourceCommon[]>([]);
    const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
      groupVersionKind: modelToGroupVersionKind(ProjectModel),
      isList: true,
      namespaced: false,
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
        <Text className="templates-catalog-project-dropdown-label" component={TextVariants.h6}>
          {t('Template project')}
        </Text>
        <ContextSelector
          className=""
          isOpen={isOpen}
          isPlain
          isText
          onSearchInputChange={onSearchInputChange}
          onSelect={onSelect}
          onToggle={() => setOpen(!isOpen)}
          screenReaderLabel="Selected Project:"
          searchInputPlaceholder={t('Search')}
          searchInputValue={searchValue}
          toggleText={selectedProject || ALL_PROJECTS_SELECTOR}
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
