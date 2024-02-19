import React, { Dispatch, FC, SetStateAction } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import FilterSelect from '@kubevirt-utils/components/FilterSelect/FilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

type DiskSourcePVCSelectNamespaceProps = {
  isDisabled?: boolean;
  onChange: Dispatch<SetStateAction<string>>;
  projectNames: string[];
  projectsLoaded: boolean;
  selectedProject: string;
};

const DiskSourcePVCSelectNamespace: FC<DiskSourcePVCSelectNamespaceProps> = ({
  isDisabled,
  onChange,
  projectNames,
  projectsLoaded,
  selectedProject,
}) => {
  const { t } = useKubevirtTranslation();

  const fieldId = 'pvc-project-select';

  return (
    <FormGroup
      className="pvc-selection-formgroup"
      fieldId={fieldId}
      id={fieldId}
      isRequired
      label={t('PVC project')}
    >
      {projectsLoaded ? (
        <>
          <FilterSelect
            options={projectNames?.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(ProjectModel),
              value: name,
            }))}
            toggleProps={{
              isDisabled,
              isFullWidth: true,
              placeholder: t('--- Select PVC project ---'),
            }}
            selected={selectedProject}
            setSelected={onChange}
          />
          <FormGroupHelperText>{t('Location of the existing PVC')}</FormGroupHelperText>
        </>
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default DiskSourcePVCSelectNamespace;
