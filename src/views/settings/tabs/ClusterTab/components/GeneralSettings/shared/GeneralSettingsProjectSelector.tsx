import React, { type FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
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
      options={projects
        .flatMap((proj) => {
          const name = getName(proj);
          if (!name) return [];
          return [{ groupVersionKind: modelToGroupVersionKind(ProjectModel), value: name }];
        })
        .sort((a, b) => a.value.localeCompare(b.value))}
      placeholder={t('Select project')}
      selected={selectedProject}
      setSelected={onSelect}
      toggleProps={{
        icon: !loaded && <Spinner size="sm" />,
        isDisabled: !loaded,
      }}
    />
  );
};

export default GeneralSettingsProjectSelector;
