import React, { FC, useCallback } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { getInitialStateDiskForm } from '@kubevirt-utils/components/DiskModal/utils/constants';
import { DiskFormState, SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import DiskSourceFlyoutMenu from '@kubevirt-utils/components/DiskSourceFlyoutMenu/DiskSourceFlyoutMenu';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { replaceTemplateVM } from '@kubevirt-utils/resources/template';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
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
          <DiskSourceFlyoutMenu
            onSelect={(diskSource: SourceTypes) => {
              const diskState: DiskFormState = {
                ...getInitialStateDiskForm(),
                diskName: generatePrettyName('disk'),
                diskSource: diskSource,
              };

              return createModal(({ isOpen, onClose }) => (
                <DiskModal
                  createOwnerReference={false}
                  headerText={t('Add disk')}
                  initialFormData={diskState}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={onUpdate}
                  vm={vm}
                />
              ));
            }}
            className="list-page-create-button-margin"
            isTemplate
          />
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
