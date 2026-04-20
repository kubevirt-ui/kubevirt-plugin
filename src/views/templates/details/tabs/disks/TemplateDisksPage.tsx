import React, { FCC, useCallback, useMemo } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskSourceSelect from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/DiskSourceSelect';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { replaceTemplateVM, updateTemplate } from '@kubevirt-utils/resources/template';
import { ListPageFilter, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Stack, StackItem } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../hooks/useIsTemplateEditable';

import useDisksFilters from './hooks/useDisksFilters';
import useTemplateDisksTableData from './hooks/useTemplateDisksTableData';
import {
  getTemplateDiskColumns,
  getTemplateDiskRowId,
  TemplateDiskCallbacks,
} from './templateDisksTableDefinition';
import { getTemplateVMWithNamespace } from './utils';

type TemplateDisksPageProps = {
  obj: V1Template;
};

const TemplateDisksPage: FCC<TemplateDisksPageProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [disks, disksLoaded, loadError] = useTemplateDisksTableData(template);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);
  const vm = getTemplateVMWithNamespace(template);
  const columns = useMemo(() => getTemplateDiskColumns(t), [t]);

  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const onUpdate = useCallback(
    async (updatedVM: V1VirtualMachine) => {
      await updateTemplate(replaceTemplateVM(template, updatedVM));
    },
    [template],
  );

  const callbacks: TemplateDiskCallbacks = useMemo(
    () => ({ actionsDisabled: !isTemplateEditable, onUpdate, vm }),
    [isTemplateEditable, onUpdate, vm],
  );

  return (
    <PageSection>
      <SidebarEditor<V1Template> onResourceUpdate={updateTemplate} resource={template}>
        <Stack hasGutter>
          <DiskListTitle />
          {isTemplateEditable && vm && (
            <StackItem>
              <DiskSourceSelect
                onSelect={(diskSource: SourceTypes) => {
                  return createModal(({ isOpen, onClose }) => (
                    <DiskModal
                      createDiskSource={diskSource}
                      isOpen={isOpen}
                      onClose={onClose}
                      onSubmit={onUpdate}
                      vm={vm}
                    />
                  ));
                }}
              />
            </StackItem>
          )}
          <StackItem>
            <ListPageFilter
              data={data}
              hideLabelFilter
              loaded={disksLoaded}
              onFilterChange={onFilterChange}
              rowFilters={filters}
            />
            <KubevirtTable
              ariaLabel={t('Template disks table')}
              callbacks={callbacks}
              columns={columns}
              data={filteredData}
              dataTest="template-disks-table"
              fixedLayout
              getRowId={getTemplateDiskRowId}
              initialSortKey="name"
              loaded={disksLoaded}
              loadError={loadError}
              noDataMsg={t('No disks found')}
              unfilteredData={data}
            />
          </StackItem>
        </Stack>
      </SidebarEditor>
    </PageSection>
  );
};

export default TemplateDisksPage;
