import React, { Dispatch, FC, SetStateAction } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

type DiskSourceDataSourceSelectNamespaceProps = {
  isDisabled?: boolean;
  onChange: Dispatch<SetStateAction<string>>;
  projectsLoaded: boolean;
  projectsNames: string[];
  selectedProject: string;
};

const DiskSourceDataSourceSelectNamespace: FC<DiskSourceDataSourceSelectNamespaceProps> = ({
  isDisabled,
  onChange,
  projectsLoaded,
  projectsNames,
  selectedProject,
}) => {
  const { t } = useKubevirtTranslation();

  const fieldId = 'ds-project-select';
  const dsLabel = DataSourceModel.label;

  return (
    <FormGroup
      className="ds-selection-formgroup"
      fieldId={fieldId}
      id={fieldId}
      isRequired
      label={t('{{dsLabel}} project', { dsLabel })}
    >
      {projectsLoaded ? (
        <InlineFilterSelect
          options={projectsNames?.map((name) => ({
            children: name,
            groupVersionKind: modelToGroupVersionKind(ProjectModel),
            value: name,
          }))}
          toggleProps={{
            isDisabled,
            isFullWidth: true,
            placeholder: t('--- Select {{dsLabel}} project ---', { dsLabel }),
          }}
          selected={selectedProject}
          setSelected={onChange}
        />
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default DiskSourceDataSourceSelectNamespace;
