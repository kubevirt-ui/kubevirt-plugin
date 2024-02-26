import React, { FC } from 'react';

import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  DescriptionList,
  Grid,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';

import { updateAnnotation, updateLabels } from '../details/utils/utils';
import { ConfigurationInnerTabProps } from '../utils/types';

import MetadataTabAnnotations from './components/MetadataTabAnnotations/MetadataTabAnnotations';
import MetadataTabLabels from './components/MetadataTabLabels/MetadataTabLabels';

const MetadataTab: FC<ConfigurationInnerTabProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <PageSection variant={PageSectionVariants.light}>
      <Title headingLevel="h2">
        <SearchItem id="metadata">{t('Metadata')}</SearchItem>
      </Title>
      <Grid span={6}>
        <DescriptionList className="pf-c-description-list">
          <VirtualMachineDescriptionItem
            bodyContent={t(
              'Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. ',
            )}
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <LabelsModal
                  isOpen={isOpen}
                  obj={vm}
                  onClose={onClose}
                  onLabelsSubmit={(labels) => updateLabels(vm, labels)}
                />
              ))
            }
            breadcrumb="VirtualMachine.metadata.labels"
            data-test-id={`${getName(vm)}-labels`}
            descriptionData={<MetadataTabLabels labels={vm?.metadata?.labels} />}
            descriptionHeader={<SearchItem id="labels">{t('Labels')}</SearchItem>}
            editOnTitleJustify
            isEdit
            isPopover
            moreInfoURL="http://kubernetes.io/docs/user-guide/labels"
            showEditOnTitle
          />
          <VirtualMachineDescriptionItem
            bodyContent={t(
              'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. ',
            )}
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <AnnotationsModal
                  isOpen={isOpen}
                  obj={vm}
                  onClose={onClose}
                  onSubmit={(annotations) => updateAnnotation(vm, annotations)}
                />
              ))
            }
            breadcrumb="VirtualMachine.metadata.annotations"
            descriptionData={<MetadataTabAnnotations annotations={vm?.metadata?.annotations} />}
            descriptionHeader={<SearchItem id="metadata">{t('Annotations')}</SearchItem>}
            isEdit
            isPopover
            moreInfoURL="http://kubernetes.io/docs/user-guide/annotations"
          />
        </DescriptionList>
      </Grid>
    </PageSection>
  );
};

export default MetadataTab;
