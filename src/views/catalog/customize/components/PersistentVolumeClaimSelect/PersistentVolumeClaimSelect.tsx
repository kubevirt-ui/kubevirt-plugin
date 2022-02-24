import * as React from 'react';

import { PersistentVolumeClaimModel, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  RedExclamationCircleIcon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Select, SelectOption, SelectVariant, Skeleton } from '@patternfly/react-core';

import './PersistentVolumeClaimSelect.scss';

type PersistentVolumeClaimSelectProps = {
  pvcNameSelected: string;
  namespaceSelected: string;
  selectNamespace: (namespace: string) => void;
  selectPVCName: (pvcName: string) => void;
  error?: string;
};

export const PersistentVolumeClaimSelect: React.FC<PersistentVolumeClaimSelectProps> = ({
  pvcNameSelected,
  namespaceSelected,
  selectPVCName,
  selectNamespace,
  error,
}) => {
  const { t } = useKubevirtTranslation();

  const [pvcSelectOpen, setPVCSelectOpen] = React.useState(false);

  const [isNamespacePVCOpen, setNamespaceOpen] = React.useState(false);

  const [projects, projectsLoaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: {
      group: ProjectModel.apiGroup,
      version: ProjectModel.apiVersion,
      kind: ProjectModel.kind,
    },
    namespaced: false,
    isList: true,
  });

  const [pvcOptions, pvcsLoaded] = useK8sWatchResource<V1alpha1PersistentVolumeClaim[]>({
    groupVersionKind: {
      version: PersistentVolumeClaimModel.apiVersion,
      kind: PersistentVolumeClaimModel.kind,
    },
    namespaced: false,
    isList: true,
  });

  const projectsNames = projects.map((project) => project.metadata.name);

  const pvcNamesFilteredByProjects = pvcOptions
    .filter((pvc) => pvc.metadata.namespace === namespaceSelected)
    .map((pvc) => pvc.metadata.name);

  const onSelectNamespace = React.useCallback(
    (event, selection) => {
      selectNamespace(selection);
      selectPVCName(undefined);
      setNamespaceOpen(false);
    },
    [selectNamespace, selectPVCName],
  );

  const onPVCSelected = React.useCallback(
    (event, selection) => {
      selectPVCName(selection);
      setPVCSelectOpen(false);
    },
    [selectPVCName],
  );

  const filter = (options) => {
    return (_, value) => {
      let newOptions = options;

      if (value) {
        const regex = new RegExp(value, 'i');
        newOptions = options.filter((namespace) => regex.test(namespace));
      }

      return newOptions.map((namespace) => (
        <SelectOption key={namespace} value={namespace} />
      )) as React.ReactElement[];
    };
  };

  if (!projectsLoaded || !pvcsLoaded)
    return (
      <div>
        <br />
        <Skeleton fontSize="lg" className="pvc-selection-formgroup" />
        <br />
        <Skeleton fontSize="lg" className="pvc-selection-formgroup" />
        <br />
        <br />
      </div>
    );

  return (
    <div>
      <FormGroup
        label={t('Persistent Volume Claim project')}
        fieldId={`pvc-project`}
        isRequired
        className="pvc-selection-formgroup"
        validated={error && !namespaceSelected ? 'error' : 'default'}
        helperTextInvalid={error}
        helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      >
        <Select
          isOpen={isNamespacePVCOpen}
          onToggle={() => setNamespaceOpen(!isNamespacePVCOpen)}
          onSelect={onSelectNamespace}
          variant={SelectVariant.single}
          onFilter={filter(projectsNames)}
          hasInlineFilter
          selections={namespaceSelected}
          placeholderText={t(`--- Select ${PersistentVolumeClaimModel.label} project ---`)}
          validated={error && !namespaceSelected ? 'error' : 'default'}
          aria-invalid={error && !namespaceSelected ? true : false}
        >
          {projectsNames.map((projectName) => (
            <SelectOption key={projectName} value={projectName}>
              <span className="sr-only">{t('project')}</span>
              <span className="co-m-resource-icon co-m-resource-project">PR</span> {projectName}
            </SelectOption>
          ))}
        </Select>
      </FormGroup>
      <FormGroup
        label={t('Persistent Volume Claim name')}
        fieldId={`pvc-name`}
        isRequired
        className="pvc-selection-formgroup"
        validated={error && !pvcNameSelected ? 'error' : 'default'}
        helperTextInvalid={error}
        helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      >
        <Select
          isOpen={pvcSelectOpen}
          onToggle={() => setPVCSelectOpen(!pvcSelectOpen)}
          onSelect={onPVCSelected}
          variant={SelectVariant.typeahead}
          selections={pvcNameSelected}
          onFilter={filter(pvcNamesFilteredByProjects)}
          placeholderText={t(`--- Select ${PersistentVolumeClaimModel.label} name ---`)}
          isDisabled={!namespaceSelected}
          validated={error && !pvcNameSelected ? 'error' : 'default'}
          aria-invalid={error && !pvcNameSelected ? true : false}
        >
          {pvcNamesFilteredByProjects.map((pvcName) => (
            <SelectOption key={pvcName} value={pvcName} />
          ))}
        </Select>
      </FormGroup>
    </div>
  );
};
