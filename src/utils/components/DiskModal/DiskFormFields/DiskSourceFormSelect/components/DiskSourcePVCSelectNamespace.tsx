import * as React from 'react';

import { ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { FilterPVCSelect } from '../../utils/Filters';

type DiskSourcePVCSelectNamespaceProps = {
  projectsName: string[];
  selectedProject: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  projectsLoaded: boolean;
  isDisabled?: boolean;
};

const DiskSourcePVCSelectNamespace: React.FC<DiskSourcePVCSelectNamespaceProps> = ({
  selectedProject,
  projectsName,
  onChange,
  projectsLoaded,
  isDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const [isNamespacePVCOpen, setNamespaceOpen] = React.useState(false);

  const onSelect = React.useCallback(
    (event, selection) => {
      onChange(selection);
      setNamespaceOpen(false);
    },
    [onChange],
  );

  const fieldId = 'pvc-project-select';

  return (
    <FormGroup
      label={t('Persistent Volume Claim project')}
      fieldId={fieldId}
      id={fieldId}
      isRequired
      className="pvc-selection-formgroup"
    >
      {projectsLoaded ? (
        <Select
          menuAppendTo="parent"
          aria-labelledby={fieldId}
          isOpen={isNamespacePVCOpen}
          onToggle={() => setNamespaceOpen(!isNamespacePVCOpen)}
          onSelect={onSelect}
          variant={SelectVariant.single}
          onFilter={FilterPVCSelect(projectsName)}
          hasInlineFilter
          selections={selectedProject}
          placeholderText={t('--- Select PersistentVolumeClaim project ---')}
          isDisabled={isDisabled}
          maxHeight={400}
        >
          {projectsName.map((projectName) => (
            <SelectOption key={projectName} value={projectName}>
              <ResourceLink kind={ProjectModel.kind} name={projectName} linkTo={false} />
            </SelectOption>
          ))}
        </Select>
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default DiskSourcePVCSelectNamespace;
