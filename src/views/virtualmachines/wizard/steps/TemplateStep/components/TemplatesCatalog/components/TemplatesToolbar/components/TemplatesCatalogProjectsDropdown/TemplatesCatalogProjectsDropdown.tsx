import React, { type FC, memo, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';

import './TemplatesCatalogProjectsDropdown.scss';

type TemplatesCatalogProjectsDropdownProps = {
  onChange: (project: string) => void;
  selectedProject: string;
};

export const TemplatesCatalogProjectsDropdown: FC<TemplatesCatalogProjectsDropdownProps> = memo(
  ({ onChange, selectedProject }) => {
    const { control } = useFormContext<VMWizardFormValues>();
    const cluster = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER });
    const [projects] = useK8sWatchData<K8sResourceCommon[]>({
      cluster,
      groupVersionKind: modelToGroupVersionKind(ProjectModel),
      isList: true,
      namespaced: false,
    });

    const options = useMemo(
      () => [
        { children: ALL_PROJECTS, value: ALL_PROJECTS },
        ...[...projects]
          .sort((a, b) => getName(a).localeCompare(getName(b)))
          .map((proj) => {
            const name = getName(proj);
            return { children: name, value: name };
          }),
      ],
      [projects],
    );

    const onSelect = (value: string) => {
      onChange(value === ALL_PROJECTS ? '' : value);
    };

    return (
      <div className="templates-catalog-project-dropdown">
        <InlineFilterSelect
          options={options}
          selected={selectedProject || ALL_PROJECTS}
          setSelected={onSelect}
          toggleProps={{ isFullWidth: true }}
        />
      </div>
    );
  },
);

TemplatesCatalogProjectsDropdown.displayName = 'TemplatesCatalogProjectsDropdown';
