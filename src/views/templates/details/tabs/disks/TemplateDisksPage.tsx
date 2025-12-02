import React, { FC, useCallback } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskSourceSelect from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/DiskSourceSelect';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { replaceTemplateVM, updateTemplate } from '@kubevirt-utils/resources/template';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Stack, StackItem } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../hooks/useIsTemplateEditable';

import DiskRow from './components/DiskRow';
import useDiskColumns from './hooks/useDiskColumns';
import useDisksFilters from './hooks/useDisksFilters';
import useTemplateDisksTableData from './hooks/useTemplateDisksTableData';
import { getTemplateVMWithNamespace } from './utils';

type TemplateDisksPageProps = {
  obj: V1Template;
};

const TemplateDisksPage: FC<TemplateDisksPageProps> = ({ obj: template }) => {
  const { createModal } = useModal();
  const columns = useDiskColumns();
  const [disks, disksLoaded] = useTemplateDisksTableData(template);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);
  const vm = getTemplateVMWithNamespace(template);

  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const onUpdate = useCallback(
    async (updatedVM: V1VirtualMachine) => {
      await updateTemplate(replaceTemplateVM(template, updatedVM));
    },
    [template],
  );

  return (
    <PageSection>
      <SidebarEditor<V1Template> onResourceUpdate={updateTemplate} resource={template}>
        <Stack hasGutter>
          <DiskListTitle />
          {isTemplateEditable && (
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
            <VirtualizedTable
              columns={columns}
              data={filteredData}
              loaded={disksLoaded}
              loadError={undefined}
              Row={DiskRow}
              rowData={{ actionsDisabled: !isTemplateEditable, onUpdate, vm }}
              unfilteredData={data}
            />
          </StackItem>
        </Stack>
      </SidebarEditor>
    </PageSection>
  );
};

export default TemplateDisksPage;
