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
  isList: true,
  optional: true,
  groupVersionKind: modelToGroupVersionKind(TemplateModel),
  namespace: TEMPLATE_VM_COMMON_NAMESPACE,
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
    <Alert isInline variant={AlertVariant.warning} title="PVC Delete">
      <Trans t={t} ns="plugin__kubevirt-plugin">
        <p>
          Deleting this PVC will also delete{' '}
          <strong className="co-break-word">{pvc?.metadata?.name}</strong> Data Volume
        </p>
        {!loadedPvcs && !loadedTemplates && <p>Checking for usages of this PVC...</p>}
        {(errorPvcs || errorTemplates) && <p>Error checking for usages of this PVC.</p>}
        {isGolden && (
          <p>
            <strong className="co-break-word">WARNING:</strong> this PVC is used as a base operating
            system image. New VMs will not be able to clone this image
          </p>
        )}
      </Trans>
    </Alert>
  );
};

export default PVCDeleteAlertExtension;
