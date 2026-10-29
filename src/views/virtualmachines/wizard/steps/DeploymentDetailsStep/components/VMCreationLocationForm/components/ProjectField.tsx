import { type FC, useCallback } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import NamespaceDropdown, {
  type NamespaceDropdownProjectCreatedHandler,
} from '@kubevirt-utils/components/ClusterProjectDropdown/NamespaceDropdown';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';

import useClearLocationDependentVM from '../hooks/useClearLocationDependentVM';

type ProjectFieldProps = {
  isValidatingDefaultAccess: boolean;
};

const ProjectField: FC<ProjectFieldProps> = ({ isValidatingDefaultAccess }) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();
  const { control, getValues, setValue } = useVMWizardForm();
  const clearLocationDependentVM = useClearLocationDependentVM();

  const [cluster, project] = useWatch({
    control,
    name: ['deployment.cluster', 'deployment.project'],
  });

  const onLocationProjectCreated = useCallback<NamespaceDropdownProjectCreatedHandler>(
    (createdProject) => {
      const projectName = getName(createdProject);
      const projectCluster = getCluster(createdProject);
      if (!projectName) {
        return;
      }
      if (isACMPage && projectCluster) {
        setValue('deployment.cluster', projectCluster, { shouldValidate: true });
      }
      setValue('deployment.project', projectName, { shouldValidate: true });
      setValue('deployment.folder', '');
      clearLocationDependentVM();
    },
    [clearLocationDependentVM, isACMPage, setValue],
  );

  return (
    <FormGroup isRequired label={t('Project')}>
      <Controller
        control={control}
        name="deployment.project"
        render={({ field: { onChange: onProjectFieldChange, ref: _ref }, fieldState }) => (
          <>
            <NamespaceDropdown
              bookmarkCluster={hubClusterName}
              cluster={cluster}
              includeAllProjects={false}
              isLoading={isValidatingDefaultAccess}
              onChange={(selectedProject) => {
                if (selectedProject === getValues('deployment.project')) return;
                onProjectFieldChange(selectedProject);
                setValue('deployment.folder', '');
                clearLocationDependentVM();
              }}
              onlyUserProjects
              onProjectCreated={onLocationProjectCreated}
              selectedProject={project ?? ''}
            />
            {fieldState.error?.message && fieldState.isTouched && (
              <FormGroupHelperText validated={ValidatedOptions.error}>
                {fieldState.error.message}
              </FormGroupHelperText>
            )}
          </>
        )}
      />
    </FormGroup>
  );
};

export default ProjectField;
