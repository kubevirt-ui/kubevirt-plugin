import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import produce from 'immer';

import { SecretModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1beta1DataVolumeSpec, V1ContainerDiskSource } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { addSecretToVM } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
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
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';

import { useWizardVMContext } from '../../../utils/WizardVMContext';
import { INSTALLATION_CDROM_NAME } from '../../constants';
import { getUploadDataVolume, processTemplate } from '../../utils';

type useCustomizeFormSubmitType = {
  cdUpload?: DataUpload;
  diskUpload?: DataUpload;
  error: any;
  loaded: boolean;
  onCancel: () => Promise<{
    metadata: {
      name: string;
      namespace: string;
    };
  }>;
  onSubmit: (_data: any, event: { target: HTMLFormElement }) => Promise<void>;
};

export const useCustomizeFormSubmit = ({
  cdSource,
  diskSource,
  template,
  withWindowsDrivers,
}: {
  cdSource?: V1beta1DataVolumeSpec | V1ContainerDiskSource;
  diskSource?: V1beta1DataVolumeSpec;
  template: V1Template;
  withWindowsDrivers?: boolean;
}): useCustomizeFormSubmitType => {
  const { ns } = useParams<{ ns: string }>();
  const history = useHistory();
  const [templateLoaded, setTemplateLoaded] = useState(true);
  const [templateError, setTemplateError] = useState<any>();

  const { loaded: vmLoaded, tabsData, updateTabsData, updateVM, vm } = useWizardVMContext();

  const { upload: diskUpload, uploadData: uploadDiskData } = useCDIUpload();
  const { upload: cdUpload, uploadData: uploadCDData } = useCDIUpload();

  const onSubmit = async (data: { [x: string]: any }, event: { target: HTMLFormElement }) => {
    const diskUploadFile = data?.['disk-boot-source-uploadFile'];
    const cdUploadFile = data?.['cd-boot-source-uploadFile'];

    setTemplateError(undefined);
    setTemplateLoaded(false);
    try {
      const formData = new FormData(event.target);
      const processedTemplate = await processTemplate({
        formData,
        namespace: ns || DEFAULT_NAMESPACE,
        template,
        withWindowsDrivers,
      });

      const vmObj = getTemplateVirtualMachineObject(processedTemplate);
      const additionalObjects = processedTemplate.objects.filter(
        (obj) => obj.kind !== VirtualMachineModel.kind,
      );

      const dataVolumeTemplate = vmObj?.spec?.dataVolumeTemplates?.[0];
      const updatedVM = produce(vmObj, (vmDraft) => {
        ensurePath(vmDraft, [
          'spec.template.spec.domain.resources',
          'spec.template.spec.domain.cpu',
        ]);

        vmDraft.metadata.namespace = ns || DEFAULT_NAMESPACE;
        vmDraft.metadata.labels[LABEL_USED_TEMPLATE_NAME] = processedTemplate.metadata.name;
        vmDraft.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = template.metadata.namespace;
        vmDraft.spec.template.spec.domain.resources.requests = {
          ...vmDraft?.spec?.template?.spec?.domain?.resources?.requests,
          memory: `${vm.spec.template.spec.domain.resources.requests['memory']}`,
        };
        vmDraft.spec.template.spec.domain.cpu.cores = vm.spec.template.spec.domain.cpu.cores;

        // upload is required, we need to patch the volume and delete the data volume template (keep only cd dv template if available)
        if (diskUploadFile) {
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
        // additional objects
        tabsDataDraft.additionalObjects = !isEmpty(tabsData?.authorizedSSHKey)
          ? additionalObjects.filter((obj) => obj?.kind !== SecretModel.kind)
          : additionalObjects;

        // overview
        ensurePath(tabsDataDraft, 'overview.templateMetadata');
        tabsDataDraft.overview.templateMetadata.name = template.metadata.name;
        tabsDataDraft.overview.templateMetadata.namespace = template.metadata.namespace;
        tabsDataDraft.overview.templateMetadata.osType = getTemplateOS(template);
        tabsDataDraft.overview.templateMetadata.displayName = getAnnotation(
          template,
          ANNOTATIONS.displayName,
        );

        // upload dvs
        if (tabsDataDraft?.disks?.dataVolumesToAddOwnerRef) {
          tabsDataDraft.disks.dataVolumesToAddOwnerRef = [];
        }
      });
      const diskUploadDV = getUploadDataVolume(
        dataVolumeTemplate?.metadata?.name,
        updatedVM.metadata.namespace,
        diskSource?.storage?.resources?.requests?.storage || '30Gi',
      );
      const cdUploadDV = getUploadDataVolume(
        `${updatedVM?.metadata?.name}-${INSTALLATION_CDROM_NAME}`,
        updatedVM.metadata.namespace,
        (cdSource as V1beta1DataVolumeSpec)?.storage?.resources?.requests?.storage || '30Gi',
      );

      await Promise.all(
        [
          {
            dataVolume: diskUploadDV,
            file: diskUploadFile,
            upload: () => uploadDiskData({ dataVolume: diskUploadDV, file: diskUploadFile?.value }),
          },
          {
            dataVolume: cdUploadDV,
            file: cdUploadFile,
            upload: () => uploadCDData({ dataVolume: cdUploadDV, file: cdUploadFile?.value }),
          },
        ]
          .filter((u) => u.file)
          .map((uploadPromise) => {
            // add ownerReference after vm creation
            updateTabsData((draft) => {
              ensurePath(draft, 'disks.dataVolumesToAddOwnerRef');
              if (draft.disks) {
                draft.disks.dataVolumesToAddOwnerRef = [
                  ...(tabsData?.disks?.dataVolumesToAddOwnerRef || []),
                  uploadPromise.dataVolume,
                ];
              }
            });
            return uploadPromise.upload();
          }),
      );

      // update context vm
      await updateVM(
        !isEmpty(tabsData?.authorizedSSHKey)
          ? addSecretToVM(updatedVM, tabsData?.authorizedSSHKey)
          : updatedVM,
      );

      history.push(`/k8s/ns/${ns || DEFAULT_NAMESPACE}/templatescatalog/review`);
      setTemplateError(undefined);
    } catch (error) {
      console.error(error);
      setTemplateError(error);
    } finally {
      setTemplateLoaded(true);
    }
  };

  useEffect(() => {
    if (templateError) {
      setTemplateError(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diskSource?.source]);

  return {
    cdUpload,
    diskUpload,
    error: templateError,
    loaded: templateLoaded && vmLoaded,
    onCancel: async () => {
      await diskUpload?.cancelUpload();
      return cdUpload?.cancelUpload();
    },
    onSubmit,
  };
};
