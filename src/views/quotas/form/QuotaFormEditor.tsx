import React, { FC, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import ProjectDropdown from '@kubevirt-utils/components/ProjectDropdown/ProjectDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { ApplicationAwareResourceQuota } from '@kubevirt-utils/resources/quotas/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ActionGroup,
  Button,
  Flex,
  Form,
  FormGroup,
  PageSection,
  Stack,
  TextInput,
} from '@patternfly/react-core';

import StandardResourceQuotaAlert from '../components/StandardResourceQuotaAlert';
import useIsDedicatedVirtualResources from '../hooks/useIsDedicatedVirtualResources';
import { getQuotaListURL } from '../utils/url';
import { getMainResourceKeys, getSpecLimits } from '../utils/utils';

import QuotaFormResourceLimitInput from './components/QuotaFormResourceLimitInput';
import useOnQuotaSubmit from './hooks/useOnQuotaSubmit';
import useOnQuotaUpdate from './hooks/useOnQuotaUpdate';

type QuotaFormEditorProps = {
  formData: ApplicationAwareResourceQuota;
  isEdit?: boolean;
  onChange?: (data: ApplicationAwareResourceQuota) => void;
};

const QuotaFormEditor: FC<QuotaFormEditorProps> = ({ formData, isEdit = false, onChange }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const namespace = useNamespaceParam();
  const isDedicatedVirtualResources = useIsDedicatedVirtualResources();
  const [error, setError] = useState<Error | null>(null);
  const onQuotaSubmit = useOnQuotaSubmit(setError, isEdit);
  const { updateHardValue, updateMetadata } = useOnQuotaUpdate(formData, onChange);

  const { cpu, memory, vmCount } = getMainResourceKeys(isDedicatedVirtualResources);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const quotaToSubmit: ApplicationAwareResourceQuota = {
      ...formData,
      metadata: {
        ...formData?.metadata,
        namespace: getNamespace(formData) || namespace,
      },
    };

    await onQuotaSubmit(quotaToSubmit);
  };

  const quotaName = getName(formData) ?? '';
  const selectedNamespace = getNamespace(formData) || namespace;

  const parseHardValue = (val: string): number => (isEmpty(val) ? NaN : parseInt(val));

  const cpuLimit = parseHardValue(getSpecLimits(formData)?.[cpu]);
  const memoryLimit = parseHardValue(getSpecLimits(formData)?.[memory]);
  const vmCountLimit = parseHardValue(getSpecLimits(formData)?.[vmCount]);

  return (
    <PageSection>
      <Form maxWidth="900px" onSubmit={handleSubmit}>
        <FormGroup fieldId="quota-name" isRequired label={t('Name')}>
          <TextInput
            id="quota-name"
            isDisabled={isEdit}
            isRequired
            name="quota-name"
            onChange={(_, value) => updateMetadata('name', value)}
            type="text"
            value={quotaName}
          />
          <FormGroupHelperText>
            {t('A unique name for the application-aware quota')}
          </FormGroupHelperText>
        </FormGroup>
        <FormGroup fieldId="quota-project" isRequired label={t('Project')}>
          <ProjectDropdown
            includeAllProjects={false}
            isDisabled={isEdit}
            onChange={(project) => updateMetadata('namespace', project)}
            selectedProject={selectedNamespace}
          />
          <FormGroupHelperText>
            {t('Applies the quota to the selected project')}
          </FormGroupHelperText>
          {!isEdit && (
            <StandardResourceQuotaAlert className="pf-v6-u-mt-md" namespace={selectedNamespace} />
          )}
        </FormGroup>
        <Stack hasGutter>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <QuotaFormResourceLimitInput
              helpIconContent={t(
                'The maximum number of virtual CPUs permitted for all VMs in this project.',
              )}
              placeholder={t('i.e., 8')}
              resourceLimitLabel={t('vCPU allocation')}
              setValue={(value) => updateHardValue(cpu, value)}
              unitLabel={t('vCPU')}
              value={cpuLimit}
            />
            <QuotaFormResourceLimitInput
              helpIconContent={t(
                'The maximum memory capacity measured in GiB permitted for all VMs in this project.',
              )}
              placeholder={t('i.e., 16')}
              resourceLimitLabel={t('Memory allocation')}
              setValue={(value) => updateHardValue(memory, value, 'Gi')}
              unitLabel={t('GiB')}
              value={memoryLimit}
            />
            <QuotaFormResourceLimitInput
              helpIconContent={t(
                'The maximum number of virtual machines that can exist in this project.',
              )}
              placeholder={t('i.e., 4')}
              resourceLimitLabel={t('VM limits')}
              setValue={(value) => updateHardValue(vmCount, value)}
              unitLabel={t('VMs')}
              value={vmCountLimit}
            />
          </Flex>
          <FormGroupHelperText>
            {t(
              'Additional workload limits (such as pods) can be added later using advanced configuration',
            )}
          </FormGroupHelperText>
        </Stack>
        {error && <ErrorAlert error={error} />}
        <ActionGroup>
          <Button isDisabled={!quotaName?.trim()} type="submit" variant="primary">
            {isEdit ? t('Save') : t('Create quota')}
          </Button>
          <Button onClick={() => navigate(getQuotaListURL(namespace))} variant="secondary">
            {t('Cancel')}
          </Button>
        </ActionGroup>
      </Form>
    </PageSection>
  );
};

export default QuotaFormEditor;
