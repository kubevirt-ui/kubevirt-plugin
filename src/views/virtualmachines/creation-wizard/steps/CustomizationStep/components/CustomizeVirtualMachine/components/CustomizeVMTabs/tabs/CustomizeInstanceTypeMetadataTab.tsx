import React, { useCallback } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import MetadataLabels from '@kubevirt-utils/components/MetadataLabels/MetadataLabels';
import { EditLabelsModal } from '@kubevirt-utils/components/MetadataModal/EditLabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabels } from '@kubevirt-utils/resources/shared';
import { updateCustomizeInstanceType } from '@kubevirt-utils/store/customizeInstanceType';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { DescriptionList, Grid, PageSection, Title } from '@patternfly/react-core';

const updateMetadata = (data: { [key: string]: string }, type: string) =>
  Promise.resolve(
    updateCustomizeInstanceType([
      {
        data,
        path: `metadata.${type}`,
      },
    ]),
  );

const CustomizeInstanceTypeMetadataTab = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const vm = vmSignal.value;

  const onEditLabels = useCallback(
    () =>
      createModal(({ isOpen, onClose }) => (
        <EditLabelsModal
          isOpen={isOpen}
          obj={vm}
          onClose={onClose}
          onLabelsSubmit={(labels) => updateMetadata(labels, 'labels')}
        />
      )),
    [createModal, vm],
  );

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="metadata">{t('Labels and annotations')}</SearchItem>
      </Title>
      <Grid span={6}>
        <DescriptionList>
          <DescriptionItem
            descriptionData={<MetadataLabels labels={getLabels(vm)} model={VirtualMachineModel} />}
            descriptionHeader={<SearchItem id="labels">{t('Labels')}</SearchItem>}
            isEdit
            isLabelEditor
            onEditClick={onEditLabels}
            showEditOnTitle
          />
          <DescriptionItemAnnotations
            descriptionHeaderWrapper={(children) => (
              <SearchItem id="annotations">{children}</SearchItem>
            )}
            model={VirtualMachineModel}
            onAnnotationsSubmit={(annotations) => updateMetadata(annotations, 'annotations')}
            resource={vm}
          />
        </DescriptionList>
      </Grid>
    </PageSection>
  );
};

export default CustomizeInstanceTypeMetadataTab;
