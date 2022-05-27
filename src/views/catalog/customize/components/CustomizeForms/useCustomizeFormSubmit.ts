import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import produce from 'immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DataUpload, useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import {
  getTemplateOS,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { getVolumes } from '@kubevirt-utils/resources/vm';

import { ensurePath, useWizardVMContext } from '../../../utils/WizardVMContext';
import { DEFAULT_NAMESPACE } from '../../constants';
import { processTemplate } from '../../utils';

type useCustomizeFormSubmitType = {
  onSubmit: (_data: any, event: { target: HTMLFormElement }) => Promise<void>;
  onCancel: () => Promise<{
    metadata: {
      name: string;
      namespace: string;
    };
  }>;
  upload?: DataUpload;
  loaded: boolean;
  error: any;
};

export const useCustomizeFormSubmit = ({
  template,
  withWindowsDrivers,
  diskSource,
}: {
  template: V1Template;
  diskSource?: V1beta1DataVolumeSpec;
  withWindowsDrivers?: boolean;
}): useCustomizeFormSubmitType => {
  const { ns } = useParams<{ ns: string }>();
  const history = useHistory();
  const [templateLoaded, setTemplateLoaded] = React.useState(true);
  const [templateError, setTemplateError] = React.useState<any>();

  const {
    updateVM,
    tabsData,
    updateTabsData,
    loaded: vmLoaded,
    error: vmError,
  } = useWizardVMContext();
  const { upload, uploadData } = useCDIUpload();

  const onSubmit = async (data, event: { target: HTMLFormElement }) => {
    // upload only supported for diskSource
    const uploadFile = data?.['disk-boot-source-uploadFile'];

    setTemplateError(undefined);
    setTemplateLoaded(false);
    try {
      const formData = new FormData(event.target);
      const processedTemplate = await processTemplate({
        template,
        namespace: ns || DEFAULT_NAMESPACE,
        formData,
        withWindowsDrivers,
      });

      const vmObj = getTemplateVirtualMachineObject(processedTemplate);

      const dataVolumeTemplate = vmObj.spec.dataVolumeTemplates[0];
      const updatedVM = produce(vmObj, (vmDraft) => {
        vmDraft.metadata.namespace = ns || DEFAULT_NAMESPACE;
        vmDraft.metadata.labels[LABEL_USED_TEMPLATE_NAME] = processedTemplate.metadata.name;
        vmDraft.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] =
          processedTemplate.metadata.namespace;

        // upload is required, we need to patch the volume and delete the data volume template (keep only cd dv template if available)
        if (uploadFile) {
          const filteredDVTs = vmObj.spec.dataVolumeTemplates.filter(
            (dvt) => dvt.metadata.name !== dataVolumeTemplate.metadata.name,
          );
          vmDraft.spec.dataVolumeTemplates = filteredDVTs;

          const otherVolumes = getVolumes(vmObj)?.filter(
            (v) => v?.dataVolume?.name !== dataVolumeTemplate?.metadata?.name,
          );
          const volumeToEdit = getVolumes(vmObj)?.find(
            (v) => v?.dataVolume?.name === dataVolumeTemplate?.metadata?.name,
          );

          vmDraft.spec.template.spec.volumes = [
            ...otherVolumes,
            {
              name: volumeToEdit.name,
              persistentVolumeClaim: {
                claimName: volumeToEdit?.dataVolume?.name,
              },
            },
          ];
        }
      });

      // keep template's name and namespace for navigation
      updateTabsData((tabsDataDraft) => {
        ensurePath(tabsDataDraft, 'overview.templateMetadata');
        tabsDataDraft.overview.templateMetadata.name = template.metadata.name;
        tabsDataDraft.overview.templateMetadata.namespace = template.metadata.namespace;
        tabsDataDraft.overview.templateMetadata.osType = getTemplateOS(template);
        tabsDataDraft.overview.templateMetadata.displayName = getAnnotation(
          template,
          ANNOTATIONS.displayName,
        );

        if (tabsDataDraft?.disks?.dataVolumesToAddOwnerRef) {
          tabsDataDraft.disks.dataVolumesToAddOwnerRef = [];
        }
      });

      if (uploadFile) {
        const dataVolume: V1beta1DataVolume = {
          apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
          kind: DataVolumeModel.kind,
          metadata: {
            name: dataVolumeTemplate.metadata.name,
            namespace: updatedVM.metadata.namespace,
          },
          spec: {
            source: {
              upload: {},
            },
            storage: {
              resources: {
                requests: {
                  storage: diskSource?.storage?.resources?.requests?.storage || '30Gi',
                },
              },
            },
          },
        };

        // add ownerReference after vm creation
        updateTabsData((draft) => {
          ensurePath(draft, 'disks.dataVolumesToAddOwnerRef');
          if (draft.disks) {
            draft.disks.dataVolumesToAddOwnerRef = [
              ...(tabsData?.disks?.dataVolumesToAddOwnerRef || []),
              dataVolume,
            ];
          }
        });

        await uploadData({ file: uploadFile?.value, dataVolume });
      }

      // update context vm
      await updateVM(updatedVM);

      history.push(`/k8s/ns/${ns || 'default'}/templatescatalog/review`);
      setTemplateError(undefined);
    } catch (error) {
      console.error(error);
      setTemplateError(error);
    } finally {
      setTemplateLoaded(true);
    }
  };

  return {
    onSubmit,
    onCancel: upload?.cancelUpload,
    loaded: templateLoaded && vmLoaded,
    error: templateError || vmError,
    upload,
  };
};
