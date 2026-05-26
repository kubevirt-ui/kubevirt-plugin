import React, { Dispatch, FC, SetStateAction } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useProjectOrNamespaceModel } from '@kubevirt-utils/hooks/useProjectOrNamespaceModel';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
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

  const model = useProjectOrNamespaceModel();
  return (
    <FormGroup
      className="pvc-selection-formgroup"
      fieldId={fieldId}
      id={fieldId}
      isRequired
      label={t('Volume project')}
    >
      {projectsLoaded ? (
        <>
          <InlineFilterSelect
            options={projectNames?.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(model),
              value: name,
            }))}
            toggleProps={{
              isDisabled,
              isFullWidth: true,
            }}
            placeholder={t('Select volume project')}
            selected={selectedProject}
            setSelected={onChange}
          />
          <FormGroupHelperText>{t('Location of the existing volume')}</FormGroupHelperText>
        </>
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default DiskSourcePVCSelectNamespace;
