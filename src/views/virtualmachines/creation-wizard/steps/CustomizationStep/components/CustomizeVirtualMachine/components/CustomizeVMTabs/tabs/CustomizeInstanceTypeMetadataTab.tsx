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
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { DescriptionList, Grid, PageSection, Title } from '@patternfly/react-core';

const CustomizeInstanceTypeMetadataTab = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const vm = vmSignal.value;

  const onEditLabels = useCallback(
    () =>
      createModal(({ isOpen, onClose }) => (
        <EditLabelsModal
          onLabelsSubmit={(labels) =>
            Promise.resolve(
              updateCustomizeInstanceType([{ data: labels, path: 'metadata.labels' }]),
            )
          }
          isOpen={isOpen}
          obj={vm}
          onClose={onClose}
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
            onAnnotationsSubmit={(annotations) =>
              Promise.resolve(
                updateCustomizeInstanceType([{ data: annotations, path: 'metadata.annotations' }]),
              )
            }
            model={VirtualMachineModel}
            resource={vm}
          />
        </DescriptionList>
      </Grid>
    </PageSection>
  );
};

export default CustomizeInstanceTypeMetadataTab;
