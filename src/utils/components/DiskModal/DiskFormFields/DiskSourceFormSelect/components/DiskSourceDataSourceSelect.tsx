import * as React from 'react';

import { useDataSourcesTypeResources } from '../../hooks/useProjectsAndDataSources';

import DiskSourceDataSourceSelectName from './DiskSourceDataSourceSelectName';
import DiskSourceDataSourceSelectNamespace from './DiskSourceDataSourceSelectNamespace';

type DiskSourceDataSourceSelectProps = {
  dataSourceNameSelected: string;
  dataSourceNamespaceSelected: string;
  selectDataSourceName: (value: string) => void;
  selectDataSourceNamespace: (value: string) => void;
};

const DiskSourceDataSourceSelect: React.FC<DiskSourceDataSourceSelectProps> = ({
  dataSourceNameSelected,
  dataSourceNamespaceSelected,
  selectDataSourceName,
  selectDataSourceNamespace,
}) => {
  const { dataSources, dataSourcesLoaded, projectsLoaded, projectsNames } =
    useDataSourcesTypeResources(dataSourceNamespaceSelected);

  const isTemplateParameter = /\$\{(.*?)\}/.test(dataSourceNamespaceSelected);

  const onSelectProject = React.useCallback(
    (newProject) => {
      selectDataSourceNamespace(newProject);
      selectDataSourceName(undefined);
    },
    [selectDataSourceNamespace, selectDataSourceName],
  );

  const dataSourceNames = React.useMemo(() => {
    return dataSources?.map((ds) => ds?.metadata?.name);
  }, [dataSources]);

  return (
    <>
      <DiskSourceDataSourceSelectNamespace
        isDisabled={!selectDataSourceNamespace}
        onChange={onSelectProject}
        projectsLoaded={projectsLoaded}
        projectsNames={projectsNames}
        selectedProject={dataSourceNamespaceSelected}
      />
      <DiskSourceDataSourceSelectName
        dataSourceNames={dataSourceNames}
        dataSourceNameSelected={dataSourceNameSelected}
        dataSourcesLoaded={dataSourcesLoaded}
        isDisabled={!dataSourceNamespaceSelected || isTemplateParameter}
        onChange={selectDataSourceName}
      />
    </>
  );
};

export default DiskSourceDataSourceSelect;
