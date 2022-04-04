import * as React from 'react';

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

export const TemplatesCatalogProjectsDropdown: React.FC<TemplatesCatalogProjectsDropdownProps> =
  React.memo(({ selectedProject, onChange }) => {
    const { t } = useKubevirtTranslation();
    const [isOpen, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');
    const [filteredProjects, setFilteredProjects] = React.useState<K8sResourceCommon[]>([]);
    const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
      groupVersionKind: modelToGroupVersionKind(ProjectModel),
      namespaced: false,
      isList: true,
    });

    const onSelect = (event: any, value: string) => {
      onChange(value === ALL_PROJECTS_SELECTOR ? '' : value);
      setOpen(!isOpen);
    };

    const onSearchInputChange = (value) => {
      setSearchValue(value);
      const filtered =
        value === ''
          ? projects
          : projects.filter((project) => project.metadata.name.includes(value));

      setFilteredProjects(filtered || []);
    };

    React.useEffect(() => {
      if (filteredProjects.length === 0 && searchValue === '') {
        setFilteredProjects(projects);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projects]);

    return (
      <div className="templates-catalog-project-dropdown">
        <Text component={TextVariants.h6} className="templates-catalog-project-dropdown-label">
          {t('Templates project')}
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
            {filteredProjects.map((item) => (
              <ContextSelectorItem key={item.metadata.name}>
                {item.metadata.name}
              </ContextSelectorItem>
            ))}
          </>
        </ContextSelector>
      </div>
    );
  });

TemplatesCatalogProjectsDropdown.displayName = 'TemplatesCatalogProjectsDropdown';
