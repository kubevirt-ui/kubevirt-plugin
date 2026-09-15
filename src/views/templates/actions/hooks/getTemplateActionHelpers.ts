// Extracted from useVirtualMachineTemplatesActions.tsx
// Root: src/views/templates/actions/hooks/useVirtualMachineTemplatesActions.tsx

import { type JSX } from 'react';
import { type NavigateFunction } from 'react-router';
import { type TFunction } from 'i18next';

import { TemplateModel, type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

export const getCommonOrPermissionDescription = (
  isCommonTemplate: boolean,
  hasPermission: boolean,
  commonMessage: string,
  permissionMessage: string,
): string | undefined => {
  if (isCommonTemplate) {
    return commonMessage;
  }
  if (!hasPermission) {
    return permissionMessage;
  }
  return undefined;
};

export const patchTemplateMetadata = (
  template: V1Template,
  cluster: string,
  type: 'annotations' | 'labels',
  value: Record<string, string>,
): Promise<V1Template> =>
  kubevirtK8sPatch({
    cluster,
    data: [{ op: 'replace', path: `/metadata/${type}`, value }],
    model: TemplateModel,
    resource: template,
  });

export type GetTemplateActionsParams = {
  baseTemplatePage: string;
  bootDataSource: undefined | V1beta1DataSource;
  canDeleteTemplate: boolean;
  canWriteToDataSourceNs: boolean;
  cluster: string;
  createModal: (modal: (props: ModalComponentProps) => JSX.Element) => void;
  editableBootSource: boolean;
  goToTemplatePage: (currentTemplate: V1Template) => void;
  hasEditPermission: boolean;
  isCommonTemplate: boolean;
  loadingBootSource: boolean;
  navigate: NavigateFunction;
  onDelete: () => Promise<void>;
  t: TFunction;
  template: V1Template;
};
