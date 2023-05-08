import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikValues, useFormikContext } from 'formik';
import * as fuzzy from 'fuzzysearch';

import ClusterServiceVersionModel from '@kubevirt-ui/kubevirt-api/console/models/ClusterServiceVersionModel';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  FirehoseResource,
  getGroupVersionKindForModel,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { Alert, FormGroup } from '@patternfly/react-core';

import {
  ClusterServiceVersionKind,
  K8sResourceKind,
} from '../../../../../../clusteroverview/utils/types';
import { getFieldId } from '../../../../../utils/common-utils';

import { getBindableResources } from './utils/utils';

export type OwnedResourceType = {
  displayName: string;
  kind: string;
  name: string;
  version: string;
};

type BindableServiceProps = {
  resource: K8sResourceKind;
};

const BindableServices: FC<BindableServiceProps> = ({ resource }) => {
  const { t } = useTranslation();
  const { setFieldValue, setFieldTouched, setStatus } = useFormikContext<FormikValues>();
  const [resourceAlert, setResourceAlert] = useState(false);
  const autocompleteFilter = (strText, item): boolean => fuzzy(strText, item?.props?.name);
  const groupVersionKind = getGroupVersionKindForModel(ClusterServiceVersionModel);
  const watchedResources = {
    csvs: {
      isList: true,
      groupVersionKind: groupVersionKind,
      namespace: resource.metadata.namespace,
      optional: true,
    },
  };
  const csvResources = useK8sWatchResources<{ csvs: ClusterServiceVersionKind[] }>(
    watchedResources,
  );
  const onServiceChange = useCallback(
    (selectedValue, name, obj) => {
      if (!isEmpty(obj)) {
        setFieldTouched('service', true);
        setFieldValue('bindableService', obj);
        setStatus({ submitError: null });
      }
    },
    [setFieldTouched, setFieldValue, setStatus],
  );

  useEffect(() => {
    setStatus({ subscriberAvailable: !resourceAlert });
  }, [resourceAlert, setStatus]);

  const handleOnLoad = (resourceList: { [key: string]: string }) => {
    setResourceAlert(isEmpty(resourceList));
  };

  const dropdownResources = useMemo(
    () => getBindableResources(resource.metadata.namespace, csvResources?.csvs),
    [csvResources, resource.metadata.namespace],
  );
  return (
    <FormGroup
      fieldId={getFieldId('bindable-service', 'dropdown')}
      label={t('console-app~Bindable service')}
      isRequired
    >
      {resourceAlert && (
        <>
          <Alert variant="default" title={t('console-app~No bindable services available')} isInline>
            {t('console-app~To create a Service binding, first create a bindable service.')}
          </Alert>
          &nbsp;
        </>
      )}
      <ResourceDropdownField
        name="service"
        resources={dropdownResources as FirehoseResource[]}
        dataSelector={['metadata', 'name']}
        fullWidth
        required
        placeholder={t('console-app~Select Service')}
        showBadge
        autocompleteFilter={autocompleteFilter}
        onChange={onServiceChange}
        autoSelect
        disabled={resourceAlert}
        onLoad={handleOnLoad}
      />
    </FormGroup>
  );
};

export default BindableServices;
