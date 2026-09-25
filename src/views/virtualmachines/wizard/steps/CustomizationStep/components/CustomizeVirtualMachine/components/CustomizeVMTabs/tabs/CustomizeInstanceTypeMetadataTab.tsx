import type { FC } from 'react';
import { useCallback } from 'react';
import produce from 'immer';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm/utils/annotations';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { PageSection } from '@patternfly/react-core';
import MetadataTabContent from '@virtualmachines/details/tabs/configuration/metadata/components/MetadataTabContent';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

import '@virtualmachines/details/tabs/configuration/metadata/metadata-tab.scss';

const CustomizeInstanceTypeMetadataTab: FC = () => {
  const { replaceDraft, vmDraft: vm } = useWizardVMDraft();
  const { getValues, setValue } = useVMWizardForm();

  const commitMetadata = useCallback(
    (data: Record<string, string>, type: 'annotations' | 'labels') => {
      if (!vm) return Promise.resolve(undefined);

      const updatedVM = produce(vm, (draft) => {
        ensurePath(draft, ['metadata']);

        draft.metadata[type] = data;
      });

      return Promise.resolve(replaceDraft(updatedVM, vm));
    },
    [replaceDraft, vm],
  );

  const syncMetadataWithForm = useCallback(
    async (
      data: Record<string, string>,
      type: 'annotations' | 'labels',
      key: string,
      field: 'deployment.description' | 'deployment.folder',
    ) => {
      const committedVM = await commitMetadata(data, type);

      if (!committedVM) return undefined;

      const value = data[key] ?? '';

      if (getValues(field) !== value) {
        setValue(field, value, { shouldDirty: true });
      }

      return committedVM;
    },
    [commitMetadata, getValues, setValue],
  );

  const onLabelsSubmit = useCallback(
    (labels: Record<string, string>) =>
      syncMetadataWithForm(labels, 'labels', VM_FOLDER_LABEL, 'deployment.folder'),
    [syncMetadataWithForm],
  );

  const onAnnotationsSubmit = useCallback(
    (annotations: Record<string, string>) =>
      syncMetadataWithForm(
        annotations,
        'annotations',
        DESCRIPTION_ANNOTATION,
        'deployment.description',
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
