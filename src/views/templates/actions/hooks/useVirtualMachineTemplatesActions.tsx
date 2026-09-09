import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  DataVolumeModel,
  TemplateModel,
  type V1Template,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { asAccessReview, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getACMTemplateListURL,
  getTemplateListURL,
  getTemplateURL,
} from '@kubevirt-utils/resources/template/utils';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';
import useIsACMPage from '@multicluster/useIsACMPage';
import { type Action } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview, useHubClusterName } from '@stolostron/multicluster-sdk';

import { createDataVolume, getBootDataSource, hasEditableBootSource } from '../editBootSource';

import useEditTemplateAccessReview from '../../details/hooks/useIsTemplateEditable';
import { getTemplateActions } from './getTemplateActions';

type UseVirtualMachineTemplatesActions = (
  template: V1Template,
) => [actions: Action[], onLazyActions: () => void];

const useVirtualMachineTemplatesActions: UseVirtualMachineTemplatesActions = (
  template: V1Template,
) => {
  const { t } = useKubevirtTranslation();
  const { hasEditPermission, isCommonTemplate } = useEditTemplateAccessReview(template);
  const { createModal } = useModal();
  const navigate = useNavigate();
  const [bootDataSource, setBootDataSource] = useState<V1beta1DataSource>();
  const [loadingBootSource, setLoadingBootSource] = useState(true);
  const editableBootSource = hasEditableBootSource(bootDataSource);
  const namespace = useNamespaceParam();
  const [hubClusterName] = useHubClusterName();
  const cluster = getCluster(template) ?? hubClusterName;
  const isACMPage = useIsACMPage();
  const baseTemplatePage = getTemplateURL(
    getName(template),
    getNamespace(template),
    isACMPage ? cluster : undefined,
  );

  const [canDeleteTemplate] = useFleetAccessReview({
    cluster,
    namespace: getNamespace(template),
    resource: TemplateModel.plural,
    verb: 'delete',
  });

  const [canWriteToDataSourceNs] = useFleetAccessReview(
    asAccessReview(
      DataVolumeModel,
      createDataVolume(
        bootDataSource?.spec?.source?.pvc?.name,
        bootDataSource?.spec?.source?.pvc?.namespace,
        {},
        cluster,
      ),
      'create',
    ),
  );

  const goToTemplatePage = (currentTemplate: V1Template): void => {
    navigate(
      getTemplateURL(
        getName(currentTemplate),
        getNamespace(currentTemplate),
        isACMPage ? cluster : undefined,
      ),
    );
  };

  const onLazyActions = useCallback((): void => {
    const loadBootSource = async (): Promise<void> => {
      if (!bootDataSource) {
        const dataSource = await getBootDataSource(template);
        setBootDataSource(dataSource);
      }
      setLoadingBootSource(false);
    };
    loadBootSource().catch(kubevirtConsole.error);
  }, [bootDataSource, template]);

  const onDelete = async (): Promise<void> => {
    await kubevirtK8sDelete({
      cluster,
      model: TemplateModel,
      resource: template,
    }).then((): void => {
      navigate(isACMPage ? getACMTemplateListURL() : getTemplateListURL(namespace));
    });
  };

  const actions = getTemplateActions({
    baseTemplatePage,
    bootDataSource,
    canDeleteTemplate,
    canWriteToDataSourceNs,
    cluster,
    createModal,
    editableBootSource,
    goToTemplatePage,
    hasEditPermission,
    isCommonTemplate,
    loadingBootSource,
    navigate,
    onDelete,
    t,
    template,
  });

  return [actions, onLazyActions];
};

export default useVirtualMachineTemplatesActions;
