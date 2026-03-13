import React, { FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Spinner } from '@patternfly/react-core';

type GeneralSettingsProjectSelectorProps = {
  loaded: boolean;
  onSelect: (value: string) => void;
  projects: K8sResourceCommon[];
  selectedProject: string;
};
const GeneralSettingsProjectSelector: FC<GeneralSettingsProjectSelectorProps> = ({
  loaded,
  onSelect,
  projects,
  selectedProject,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <InlineFilterSelect
      options={[
        ...projects
          ?.map((proj) => ({
            groupVersionKind: modelToGroupVersionKind(ProjectModel),
            value: getName(proj),
          }))
          .sort((a, b) => a.value.localeCompare(b.value)),
      ]}
      toggleProps={{
        icon: !loaded && <Spinner size="sm" />,
        isDisabled: !loaded,
        placeholder: t('Select project'),
      }}
      selected={selectedProject}
      setSelected={onSelect}
    />
  );
};

export default GeneralSettingsProjectSelector;
