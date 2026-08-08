import React, { FC, useCallback, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskSourceSelect from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/DiskSourceSelect';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { replaceTemplateVM, Template, updateTemplate } from '@kubevirt-utils/resources/template';
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
  obj: Template;
};

const TemplateDisksPage: FC<TemplateDisksPageProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [disks, disksLoaded, loadError] = useTemplateDisksTableData(template);
  const filterDefinitions = useDisksFilters();

  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: disks,
    filterDefinitions,
    hideLabelFilter: true,
  });

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
      <SidebarEditor<Template> onResourceUpdate={updateTemplate} resource={template}>
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
            <KubevirtFilterToolbar
              clearAllFilters={clearAllFilters}
              data={disks}
              filterDefinitions={filterDefinitions}
              filters={filters}
              hideLabelFilter
              loaded={disksLoaded}
              onSetFilters={onSetFilters}
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
              unfilteredData={disks}
            />
          </StackItem>
        </Stack>
      </SidebarEditor>
    </PageSection>
  );
};

export default TemplateDisksPage;
