import React from 'react';
import { Trans } from 'react-i18next';

import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_VM_COMMON_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { useK8sWatchResource, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant } from '@patternfly/react-core';

import useBaseImages from './hooks/useBaseImages';

const templatesResource: WatchK8sResource = {
  groupVersionKind: modelToGroupVersionKind(TemplateModel),
  isList: true,
  namespace: TEMPLATE_VM_COMMON_NAMESPACE,
  optional: true,
  selector: {
    matchLabels: { [TEMPLATE_TYPE_LABEL]: TEMPLATE_TYPE_BASE },
  },
};

const PVCDeleteAlertExtension: React.FC<{ pvc: V1alpha1PersistentVolumeClaim }> = ({ pvc }) => {
  const [commonTemplates, loadedTemplates, errorTemplates] =
    useK8sWatchResource<V1Template[]>(templatesResource);
  const { t } = useKubevirtTranslation();
  const [goldenPvcs, loadedPvcs, errorPvcs] = useBaseImages(commonTemplates);

  const isGolden = goldenPvcs?.find(
    (goldenPvc) => goldenPvc?.metadata?.name === pvc?.metadata?.name,
  );

  return (
    <Alert isInline title="PVC Delete" variant={AlertVariant.warning}>
      <Trans ns="plugin__kubevirt-plugin" t={t}>
        <p>
          Deleting this PVC will also delete{' '}
          <strong className="co-break-word">{{ pvcName: pvc?.metadata?.name }}</strong> Data Volume
        </p>
      </Trans>
      {!loadedPvcs && !loadedTemplates && <p>{t('Checking for usages of this PVC...')}</p>}
      {(errorPvcs || errorTemplates) && <p>{t('Error checking for usages of this PVC.')}</p>}
      {isGolden && (
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          <p>
            <strong className="co-break-word">WARNING:</strong> this PVC is used as a base operating
            system image. New VMs will not be able to clone this image
          </p>
        </Trans>
      )}
    </Alert>
  );
};

export default PVCDeleteAlertExtension;
