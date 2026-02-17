import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import MetadataLabels from '@kubevirt-utils/components/MetadataLabels/MetadataLabels';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import LightspeedHelpButton from '@lightspeed/components/LightspeedHelpButton/LightspeedHelpButton';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { getCluster } from '@multicluster/helpers/selectors';
import { DescriptionList, PageSection, pluralize } from '@patternfly/react-core';

import { WizardDescriptionItem } from '../../components/WizardDescriptionItem';

import './wizard-metadata-tab.scss';

const WizardMetadataTab: WizardTab = ({ loaded, updateVM, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <PageSection className="wizard-metadata-tab">
      <SidebarEditor
        onResourceUpdate={(newVM) => updateVM(newVM)}
        pathsToHighlight={PATHS_TO_HIGHLIGHT.DETAILS_TAB}
        resource={vm}
      >
        {(resource) => (
          <>
            <DescriptionList className="wizard-metadata-tab__description-list">
              <WizardDescriptionItem
                description={
                  <MetadataLabels
                    cluster={getCluster(resource)}
                    labels={resource?.metadata?.labels}
                    model={VirtualMachineModel}
                  />
                }
                helperPopover={{
                  content: (hide) => (
                    <PopoverContentWithLightspeedButton
                      content={t(
                        'Map of string keys and values that can be used to organize and categorize (scope and select) objects',
                      )}
                      hide={hide}
                      obj={vm}
                      promptType={OLSPromptType.LABELS}
                    />
                  ),
                  header: t('Labels'),
                }}
                onEditClick={() =>
                  createModal(({ isOpen, onClose }) => (
                    <LabelsModal
                      onLabelsSubmit={(updatedLabels) =>
                        updateVM((vmDraft) => {
                          vmDraft.metadata.labels = updatedLabels;
                        })
                      }
                      isOpen={isOpen}
                      obj={vm}
                      onClose={onClose}
                    />
                  ))
                }
                isDisabled={!loaded}
                isEdit
                isLabelEditor
                showEditOnTitle
                testId="wizard-metadata-labels"
                title={t('Labels')}
              />

              <WizardDescriptionItem
                description={pluralize(
                  Object.values(resource?.metadata?.annotations || {})?.length,
                  'annotation',
                )}
                helperPopover={{
                  content: (hide) => (
                    <>
                      {t(
                        'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects.',
                      )}
                      <br />
                      <LightspeedHelpButton
                        obj={vm}
                        onClick={hide}
                        promptType={OLSPromptType.ANNOTATIONS}
                      />
                    </>
                  ),
                  header: t('Annotations'),
                }}
                onEditClick={() =>
                  createModal(({ isOpen, onClose }) => (
                    <AnnotationsModal
                      onSubmit={(updatedAnnotations) =>
                        updateVM((vmDraft) => {
                          vmDraft.metadata.annotations = updatedAnnotations;
                        })
                      }
                      isOpen={isOpen}
                      obj={vm}
                      onClose={onClose}
                    />
                  ))
                }
                isDisabled={!loaded}
                isEdit
                testId="wizard-metadata-annotations"
                title={t('Annotations')}
              />
            </DescriptionList>
          </>
        )}
      </SidebarEditor>
    </PageSection>
  );
};

export default WizardMetadataTab;
