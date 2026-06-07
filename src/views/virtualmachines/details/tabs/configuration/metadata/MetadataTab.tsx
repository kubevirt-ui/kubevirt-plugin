import React, { FC, useMemo, useRef, useState } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import {
  classifyAnnotations,
  classifyLabels,
} from '@kubevirt-utils/components/MetadataModal/utils/utils';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview, getAnnotations, getLabels } from '@kubevirt-utils/resources/shared';
import { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import {
  Flex,
  FlexItem,
  PageSection,
  Stack,
  StackItem,
  Switch,
  Title,
} from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

import { ConfigurationInnerTabProps } from '../utils/types';

import AdvancedMetadataView from './components/AdvancedMetadataView';
import MetadataSection from './components/MetadataSection';
import useLabelSearchNavigation from './utils/useLabelSearchNavigation';
import useMetadataModals from './utils/useMetadataModals';

const MetadataTab: FC<ConfigurationInnerTabProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const [isAdvancedView, setIsAdvancedView] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigateToSearch = useLabelSearchNavigation();
  const { onEditAnnotations, onEditAnnotationsAdvanced, onEditLabels } = useMetadataModals(vm);

  const accessReview = asAccessReview(VirtualMachineModel, vm, 'patch' as K8sVerb);
  const [canUpdateVM] = useFleetAccessReview(accessReview || {});

  const { systemLabels, userLabels } = useMemo(() => classifyLabels(getLabels(vm) || {}), [vm]);
  const { systemAnnotations, userAnnotations } = useMemo(
    () => classifyAnnotations(getAnnotations(vm, {})),
    [vm],
  );

  const systemLabelCount = Object.keys(systemLabels).length;
  const systemAnnotationCount = Object.keys(systemAnnotations).length;

  const onToggleAdvanced = () => {
    setIsAdvancedView(true);
    requestAnimationFrame(() => contentRef.current?.focus());
  };

  return (
    <PageSection>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2">
            <SearchItem id="metadata">{t('Labels and annotations')}</SearchItem>
          </Title>
        </StackItem>
        <StackItem>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>
              <Switch
                id="advanced-view-toggle"
                isChecked={isAdvancedView}
                label={t('Show advanced view')}
                onChange={(_event, checked) => setIsAdvancedView(checked)}
              />
            </FlexItem>
            <FlexItem>
              <HelpTextIcon
                bodyContent={t(
                  'Shows the classic metadata editor with editable label and annotation lists, similar to other OpenShift resource pages. The advanced view also includes system-managed labels and annotations.',
                )}
              />
            </FlexItem>
          </Flex>
        </StackItem>
        <StackItem>
          <div aria-label={t('Metadata content')} ref={contentRef} role="region" tabIndex={-1}>
            {isAdvancedView ? (
              <AdvancedMetadataView
                canUpdate={canUpdateVM}
                onEditAnnotations={onEditAnnotationsAdvanced}
                onEditLabels={onEditLabels}
                vm={vm}
              />
            ) : (
              <Stack hasGutter>
                <StackItem>
                  <MetadataSection
                    systemLinkLabel={t('Show advanced view for system labels ({{count}})', {
                      count: systemLabelCount,
                    })}
                    addButtonLabel={t('Add label')}
                    canUpdate={canUpdateVM}
                    data-test="labels"
                    emptyText={t('No labels yet.')}
                    helpText={t('Labels can be used to organize and categorize VMs.')}
                    metadataType="labels"
                    onClickValue={navigateToSearch}
                    onEdit={onEditLabels}
                    onToggleAdvanced={onToggleAdvanced}
                    searchId="labels"
                    systemCount={systemLabelCount}
                    title={t('Labels')}
                    userData={userLabels}
                    vm={vm}
                  />
                </StackItem>
                <StackItem>
                  <MetadataSection
                    helpText={t(
                      'Annotations store extra metadata. Unlike labels, they cannot select resources and suit larger values or configuration details.',
                    )}
                    systemLinkLabel={t('Show advanced view for system annotations ({{count}})', {
                      count: systemAnnotationCount,
                    })}
                    addButtonLabel={t('Add annotation')}
                    canUpdate={canUpdateVM}
                    data-test="annotations"
                    emptyText={t('No annotations yet.')}
                    metadataType="annotations"
                    onEdit={onEditAnnotations}
                    onToggleAdvanced={onToggleAdvanced}
                    searchId="annotations"
                    systemCount={systemAnnotationCount}
                    title={t('Annotations')}
                    userData={userAnnotations}
                    vm={vm}
                  />
                </StackItem>
              </Stack>
            )}
          </div>
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default MetadataTab;
