import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';
import { load } from 'js-yaml';

import { DataSourceModel, DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { getLabels, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sDelete } from '@multicluster/k8sRequests';
import useIsACMPage from '@multicluster/useIsACMPage';
import { K8sResourceCommon, ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import { defaultBootableVolumeYamlTemplate } from '../../../../templates/bootablevolume-yaml';

const buildDataSourceForDataVolume = (
  dv: K8sResourceCommon,
  namespace: string,
): V1beta1DataSource => ({
  apiVersion: `${DataSourceModel.apiGroup}/${DataSourceModel.apiVersion}`,
  kind: DataSourceModel.kind,
  metadata: {
    labels: getLabels(dv),
    name: getName(dv),
    namespace: getNamespace(dv) || namespace,
  },
  spec: {
    source: {
      pvc: {
        name: getName(dv),
        namespace: getNamespace(dv) || namespace,
      },
    },
  },
});

const YAML_EDITOR_CANCEL_BUTTON_ID = 'cancel';

const BootableVolumeYAMLPage: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { ns: namespace } = useParams<{ ns: string }>();
  const isACMPage = useIsACMPage();
  const selectedCluster = useSelectedCluster();
  const [error, setError] = useState<Error>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const initialResource = useMemo(
    () => load(defaultBootableVolumeYamlTemplate) as K8sResourceCommon,
    [],
  );

  const selectedNamespace = namespace || DEFAULT_NAMESPACE;
  const cluster = isACMPage ? selectedCluster : undefined;

  const bootableVolumesListURL = isACMPage
    ? `/k8s/cluster/${selectedCluster}/ns/${selectedNamespace}/bootablevolumes`
    : `/k8s/ns/${selectedNamespace}/bootablevolumes`;

  const onSave = async (yaml: string) => {
    setError(null);
    try {
      const dvData = load(yaml) as K8sResourceCommon;
      const dataSource = buildDataSourceForDataVolume(dvData, selectedNamespace);

      const createdDS = await kubevirtK8sCreate({
        cluster,
        data: dataSource,
        model: DataSourceModel,
        ns: selectedNamespace,
      });

      try {
        await kubevirtK8sCreate({
          cluster,
          data: dvData,
          model: DataVolumeModel,
          ns: selectedNamespace,
        });
      } catch (dvError) {
        try {
          await kubevirtK8sDelete({ cluster, model: DataSourceModel, resource: createdDS });
        } catch (deleteError) {
          // best-effort rollback; orphaned DS will be visible in the list
          kubevirtConsole.error('Failed to rollback DS creation', deleteError);
        }
        kubevirtConsole.error('Failed to create DV', dvError);
        throw dvError;
      }

      navigate(bootableVolumesListURL);
    } catch (apiError) {
      setError(apiError);
    }
  };

  const handleCancelClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      if (button?.id === YAML_EDITOR_CANCEL_BUTTON_ID) {
        e.preventDefault();
        e.stopPropagation();
        navigate(bootableVolumesListURL);
      }
    },
    [navigate, bootableVolumesListURL],
  );

  useEffect(() => {
    const el = wrapperRef.current;
    el?.addEventListener('click', handleCancelClick, true);
    return () => el?.removeEventListener('click', handleCancelClick, true);
  }, [handleCancelClick]);

  return (
    <>
      <div ref={wrapperRef} style={{ display: 'contents' }}>
        <ResourceYAMLEditor
          create
          header={t('Create bootable volume')}
          initialResource={initialResource}
          onSave={onSave}
        />
      </div>
      {error && <ErrorAlert error={error} />}
    </>
  );
};

export default BootableVolumeYAMLPage;
