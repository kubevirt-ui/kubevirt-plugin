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
  const { projectsNames, dataSources, projectsLoaded, dataSourcesLoaded } =
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
        projectsNames={projectsNames}
        selectedProject={dataSourceNamespaceSelected}
        onChange={onSelectProject}
        isDisabled={!selectDataSourceNamespace}
        projectsLoaded={projectsLoaded}
      />
      <DiskSourceDataSourceSelectName
        onChange={selectDataSourceName}
        dataSourceNameSelected={dataSourceNameSelected}
        dataSourceNames={dataSourceNames}
        isDisabled={!dataSourceNamespaceSelected || isTemplateParameter}
        dataSourcesLoaded={dataSourcesLoaded}
      />
    </>
  );
};

export default DiskSourceDataSourceSelect;
