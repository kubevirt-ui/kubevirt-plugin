import React, { FC, useCallback } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskSourceSelect from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/DiskSourceSelect';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { replaceTemplateVM } from '@kubevirt-utils/resources/template';
import {
  k8sUpdate,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../hooks/useIsTemplateEditable';

import DiskRow from './components/DiskRow';
import useDiskColumns from './hooks/useDiskColumns';
import useDisksFilters from './hooks/useDisksFilters';
import useTemplateDisksTableData from './hooks/useTemplateDisksTableData';
import { getTemplateVMWithNamespace } from './utils';

import './TemplateDisksPage.scss';

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

  const onSubmitTemplate = useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        data: updatedTemplate,
        model: TemplateModel,
        name: updatedTemplate?.metadata?.name,
        ns: updatedTemplate?.metadata?.namespace,
      }),
    [],
  );

  const onUpdate = useCallback(
    async (updatedVM: V1VirtualMachine) => {
      await onSubmitTemplate(replaceTemplateVM(template, updatedVM));
    },
    [onSubmitTemplate, template],
  );

  return (
    <div className="template-disks-page">
      <PageSection variant={PageSectionVariants.light}>
        <SidebarEditor<V1Template> onResourceUpdate={onSubmitTemplate} resource={template}>
          <DiskListTitle />
          {isTemplateEditable && (
            <DiskSourceSelect
              onSelect={(diskSource: SourceTypes) => {
                return createModal(({ isOpen, onClose }) => (
                  <DiskModal
                    createDiskSource={diskSource}
                    isCreated={false}
                    isOpen={isOpen}
                    onClose={onClose}
                    onSubmit={onUpdate}
                    vm={vm}
                  />
                ));
              }}
              className="list-page-create-button-margin"
            />
          )}
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
        </SidebarEditor>
      </PageSection>
    </div>
  );
};

export default TemplateDisksPage;
