import React, { FC, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import {
  ActionGroup,
  Button,
  Flex,
  Form,
  FormGroup,
  PageSection,
  TextInput,
} from '@patternfly/react-core';

import useIsDedicatedVirtualResources from '../hooks/useIsDedicatedVirtualResources';
import { getQuotaDetailsPath, getQuotaModel } from '../utils/utils';

import QuotaCreateFormProjects from './components/QuotaCreateFormProjects';
import QuotaCreateFormResourceLimitInput from './components/QuotaCreateFormResourceLimitInput';
import QuotaCreateFormScope from './components/QuotaCreateFormScope';
import { fromYaml } from './utils/fromYaml';
import { toYaml } from './utils/toYaml';
import { SCOPE } from './constants';
import { ApplicationAwareQuota, VirtualizationQuota } from './types';

type QuotaCreateFormSectionsProps = {
  formData: ApplicationAwareQuota;
  onChange?: (data: K8sResourceCommon) => void;
};

const QuotaCreateFormSections: FC<QuotaCreateFormSectionsProps> = ({ formData, onChange }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const namespace = useNamespaceParam();
  const isDedicatedVirtualResources = useIsDedicatedVirtualResources();

  const convertedQuota = fromYaml(formData, isDedicatedVirtualResources);

  const [quota, setQuota] = useState<VirtualizationQuota>({ ...convertedQuota, namespace });

  const onQuotaChange = (newQuota: VirtualizationQuota) => {
    setQuota(newQuota);
    onChange(toYaml(newQuota, isDedicatedVirtualResources));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const quotaYaml = toYaml(quota, isDedicatedVirtualResources);

    try {
      await kubevirtK8sCreate({
        data: quotaYaml,
        model: getQuotaModel(quotaYaml),
      });
      navigate(getQuotaDetailsPath(quotaYaml));
    } catch (err) {
      //setError(err.message);
    }
  };

  return (
    <PageSection>
      <Form onSubmit={handleSubmit}>
        <QuotaCreateFormScope namespace={namespace} onQuotaChange={onQuotaChange} quota={quota} />

        {quota.scope === SCOPE.cluster && (
          <QuotaCreateFormProjects onQuotaChange={onQuotaChange} quota={quota} />
        )}

        <FormGroup fieldId="quota-name" isRequired label={t('Name')}>
          <TextInput
            id="quota-name"
            isRequired
            name="quota-name"
            onChange={(_, value) => onQuotaChange({ ...quota, name: value })}
            type="text"
            value={quota.name}
          />
        </FormGroup>
        <Flex spaceItems={{ default: 'spaceItemsXl' }}>
          <QuotaCreateFormResourceLimitInput
            resourceLimitLabel={t('CPU limits')}
            setValue={(value) => onQuotaChange({ ...quota, cpuLimit: value })}
            unitLabel={t('cores')}
            value={quota.cpuLimit ?? 0}
          />
          <QuotaCreateFormResourceLimitInput
            resourceLimitLabel={t('Memory limits')}
            setValue={(value) => onQuotaChange({ ...quota, memoryLimit: value })}
            unitLabel={t('Gi')}
            value={quota.memoryLimit ?? 0}
          />
          <QuotaCreateFormResourceLimitInput
            resourceLimitLabel={t('VM limits')}
            setValue={(value) => onQuotaChange({ ...quota, vmCountLimit: value })}
            unitLabel={t('VMs')}
            value={quota.vmCountLimit ?? 0}
          />
        </Flex>
        <ActionGroup>
          <Button isDisabled={!quota.name?.trim()} type="submit" variant="primary">
            {t('Create quota')}
          </Button>
        </ActionGroup>
      </Form>
    </PageSection>
  );
};

export default QuotaCreateFormSections;
