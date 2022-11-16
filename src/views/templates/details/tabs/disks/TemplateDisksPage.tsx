import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import {
  k8sUpdate,
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';

import ButtonWithPermissionTooltip from '../../ButtonWithPermissionTooltip';
import useEditTemplateAccessReview from '../../hooks/useIsTemplateEditable';

import DiskListTitle from './components/DiskListTitle';
import DiskRow from './components/DiskRow';
import useDiskColumns from './hooks/useDiskColumns';
import useDisksFilters from './hooks/useDisksFilters';
import useTemplateDisksTableData from './hooks/useTemplateDisksTableData';

import './template-disk-tab.scss';

type TemplateDisksPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1Template;
};

const TemplateDisksPage: FC<TemplateDisksPageProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const columns = useDiskColumns();
  const [disks, disksLoaded] = useTemplateDisksTableData(template);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);
  const vm = getTemplateVirtualMachineObject(template);
  const { hasEditPermission } = useEditTemplateAccessReview(template);

  const onSubmitTemplate = useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        model: TemplateModel,
        data: updatedTemplate,
        ns: updatedTemplate?.metadata?.namespace,
        name: updatedTemplate?.metadata?.name,
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
    <div className="template-disk-tab">
      <ListPageBody>
        <SidebarEditor<V1Template> resource={template} onResourceUpdate={onSubmitTemplate}>
          <Flex className="list-page-create-button-margin">
            <FlexItem>
              <ButtonWithPermissionTooltip
                template={template}
                onClick={() =>
                  createModal(({ isOpen, onClose }) => (
                    <DiskModal
                      vm={vm}
                      isOpen={isOpen}
                      onClose={onClose}
                      onSubmit={onUpdate}
                      headerText={t('Add disk')}
                      createOwnerReference={false}
                    />
                  ))
                }
              >
                {t('Add disk')}
              </ButtonWithPermissionTooltip>
            </FlexItem>
            <FlexItem>
              <SidebarEditorSwitch />
            </FlexItem>
          </Flex>
          <DiskListTitle />
          <ListPageFilter
            data={data}
            loaded={disksLoaded}
            rowFilters={filters}
            onFilterChange={onFilterChange}
            hideLabelFilter
          />
          <VirtualizedTable
            data={filteredData}
            unfilteredData={data}
            loaded={disksLoaded}
            loadError={undefined}
            columns={columns}
            Row={DiskRow}
            rowData={{ vm, onUpdate, actionsDisabled: !hasEditPermission }}
          />
        </SidebarEditor>
      </ListPageBody>
    </div>
  );
};

export default TemplateDisksPage;
