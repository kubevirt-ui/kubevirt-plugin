import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { PageSection } from '@patternfly/react-core';
import MetadataTabContent from '@virtualmachines/details/tabs/configuration/metadata/components/MetadataTabContent';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { patchWizardCustomizedVM } from '@virtualmachines/wizard/utils/patchWizardCustomizedVM';

import '@virtualmachines/details/tabs/configuration/metadata/metadata-tab.scss';

const CustomizeInstanceTypeMetadataTab: FC = () => {
  const { control, getValues, setValue } = useVMWizard();
  const vm = useWatch({ control, name: CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM });

  const updateMetadata = useCallback(
    (data: Record<string, string>, type: string) => {
      const metadataPatch = [{ data, path: `metadata.${type}` }];

      return Promise.resolve(patchWizardCustomizedVM(getValues, setValue, metadataPatch));
    },
    [getValues, setValue],
  );

  const onLabelsSubmit = useCallback(
    async (labels: Record<string, string>) => {
      await updateMetadata(labels, 'labels');
      const folder = labels[VM_FOLDER_LABEL];
      const existingFolder = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER);

      if (folder === existingFolder) {
        return;
      }

      setValue(CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER, folder ?? '');
    },
    [getValues, setValue, updateMetadata],
  );

  const onAnnotationsSubmit = useCallback(
    async (annotations: Record<string, string>) => {
      await updateMetadata(annotations, 'annotations');
      const description = annotations[DESCRIPTION_ANNOTATION];
      const existingDescription = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.DESCRIPTION);

      if (description === existingDescription) {
        return;
      }

      setValue(CREATE_VM_FORM_FIELDS_VM_DATA.DESCRIPTION, description ?? '');
    },
    [getValues, setValue, updateMetadata],
  );

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <MetadataTabContent
        onAnnotationsSubmit={onAnnotationsSubmit}
        onLabelsSubmit={onLabelsSubmit}
        vm={vm}
      />
    </PageSection>
  );
};

export default CustomizeInstanceTypeMetadataTab;
