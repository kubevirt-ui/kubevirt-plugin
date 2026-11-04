import type { FC } from 'react';
import { useMemo } from 'react';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import useHideYamlTab, { removeYamlTabs } from '@kubevirt-utils/hooks/useHideYamlTab';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import DataVolumeDetailsPage from './DataVolumeDetailsPage';
import DataVolumePageTitle from './DataVolumePageTitle';
import DataVolumeYAMLPage from './DataVolumeYamlPage';

type DataVolumePageProps = {
  kind: string;
  name: string;
  namespace: string;
};

const DataVolumePage: FC<DataVolumePageProps> = ({ kind, name, namespace }) => {
  const { t } = useKubevirtTranslation();
  const [dataVolume, loaded, loadError] = useK8sWatchResource<V1beta1DataVolume>({
    kind,
    name,
    namespace,
  });

  const { hideYamlTab } = useHideYamlTab();
  const pages = useMemo(
    () =>
      removeYamlTabs(
        [
          {
            component: DataVolumeDetailsPage,
            href: '',
            name: t('Details'),
          },
          {
            component: DataVolumeYAMLPage,
            href: 'yaml',
            name: t('YAML'),
          },
        ],
        hideYamlTab,
      ),
    [t, hideYamlTab],
  );

  return (
    <>
      <DataVolumePageTitle dataVolume={dataVolume} name={name} namespace={namespace} />
      {loadError ? (
        <ErrorAlert error={loadError} />
      ) : loaded ? (
        <HorizontalNav pages={pages} resource={dataVolume} />
      ) : (
        <Bullseye>
          <Loading />
        </Bullseye>
      )}
    </>
  );
};

export default DataVolumePage;
