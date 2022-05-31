import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import produce from 'immer';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import {
  k8sUpdate,
  ListPageBody,
  ListPageCreateButton,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import { isCommonVMTemplate } from '../../../utils';
import NoEditableTemplateAlert from '../NoEditableTemplateAlert';

import DiskListTitle from './components/DiskListTitle';
import DiskRow from './components/DiskRow';
import useDiskColumns from './hooks/useDiskColumns';
import useDisksFilters from './hooks/useDisksFilters';
import useTemplateDisksTableData from './hooks/useTemplateDisksTableData';

type TemplateDisksPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1Template;
};

const TemplateDisksPage: React.FC<TemplateDisksPageProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const columns = useDiskColumns();
  const [disks, disksLoaded] = useTemplateDisksTableData(template);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);
  const vm = getTemplateVirtualMachineObject(template);
  const isEditDisabled = isCommonVMTemplate(template);

  const onUpdate = async (updatedVM: V1VirtualMachine) => {
    const updatedTemplate = produce(template, (draftTemplate) => {
      draftTemplate.objects = [updatedVM];
    });

    await k8sUpdate({
      model: TemplateModel,
      data: updatedTemplate,
      ns: updatedTemplate?.metadata?.namespace,
      name: updatedTemplate?.metadata?.name,
    });
  };

  return (
    <div className="template-disk-page">
      {isEditDisabled && <NoEditableTemplateAlert template={template} />}
      <ListPageHeader title="">
        <ListPageCreateButton
          isDisabled={isEditDisabled}
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <DiskModal
                vm={vm}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onUpdate}
                headerText={t('Add disk')}
              />
            ))
          }
        >
          {t('Add disk')}
        </ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <DiskListTitle />
        <ListPageFilter
          data={data}
          loaded={disksLoaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable
          data={filteredData}
          unfilteredData={data}
          loaded={disksLoaded}
          loadError={undefined}
          columns={columns}
          Row={DiskRow}
          rowData={{ vm, onUpdate, actionsDisabled: isEditDisabled }}
        />
      </ListPageBody>
    </div>
  );
};

export default TemplateDisksPage;
