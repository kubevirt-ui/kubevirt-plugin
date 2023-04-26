import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { replaceTemplateVM } from '@kubevirt-utils/resources/template';
import {
  k8sUpdate,
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../hooks/useIsTemplateEditable';

import DiskRow from './components/DiskRow';
import useDiskColumns from './hooks/useDiskColumns';
import useDisksFilters from './hooks/useDisksFilters';
import useTemplateDisksTableData from './hooks/useTemplateDisksTableData';
import { getTemplateVMWithNamespace } from './utils';

import './TemplateDisksPage.scss';

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
  const vm = getTemplateVMWithNamespace(template);

  const { isTemplateEditable } = useEditTemplateAccessReview(template);

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
    <div className="template-disks-page">
      <ListPageBody>
        <SidebarEditor<V1Template> resource={template} onResourceUpdate={onSubmitTemplate}>
          <Flex>
            <FlexItem>
              <DiskListTitle />
            </FlexItem>
            <FlexItem>
              <SidebarEditorSwitch />
            </FlexItem>
          </Flex>

          <Button
            className="template-disks-page__button"
            isDisabled={!isTemplateEditable}
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
          </Button>

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
            rowData={{ vm, onUpdate, actionsDisabled: !isTemplateEditable }}
          />
        </SidebarEditor>
      </ListPageBody>
    </div>
  );
};

export default TemplateDisksPage;
