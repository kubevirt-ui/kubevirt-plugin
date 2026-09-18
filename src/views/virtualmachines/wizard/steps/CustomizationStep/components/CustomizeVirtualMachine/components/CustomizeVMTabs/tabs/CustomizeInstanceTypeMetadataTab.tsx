import type { FC } from 'react';
import { useCallback } from 'react';
import { type Path, useWatch } from 'react-hook-form';

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
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';
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

  const syncMetadataWithForm = useCallback(
    async (
      payload: Record<string, string>,
      metadataType: 'labels' | 'annotations',
      payloadKey: string,
      formField: Path<VMWizardFormValues>,
    ): Promise<void> => {
      await updateMetadata(payload, metadataType);

      const newValue = payload[payloadKey];
      const existingValue = getValues(formField) as string;

      if (newValue === existingValue) {
        return;
      }

      setValue(formField, newValue ?? '');
    },
    [getValues, setValue, updateMetadata],
  );

  const onLabelsSubmit = useCallback(
    (labels: Record<string, string>) =>
      syncMetadataWithForm(labels, 'labels', VM_FOLDER_LABEL, CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER),
    [syncMetadataWithForm],
  );

  const onAnnotationsSubmit = useCallback(
    (annotations: Record<string, string>) =>
      syncMetadataWithForm(
        annotations,
        'annotations',
        DESCRIPTION_ANNOTATION,
        CREATE_VM_FORM_FIELDS_VM_DATA.DESCRIPTION,
      ),
    [syncMetadataWithForm],
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
