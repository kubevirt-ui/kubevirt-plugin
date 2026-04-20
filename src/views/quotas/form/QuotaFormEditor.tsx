import React, { FCC, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import ProjectDropdown from '@kubevirt-utils/components/ProjectDropdown/ProjectDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { ApplicationAwareResourceQuota } from '@kubevirt-utils/resources/quotas/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  Flex,
  Form,
  FormGroup,
  PageSection,
  TextInput,
  Tooltip,
} from '@patternfly/react-core';

import AdvancedConfigAlert from '../components/AdvancedConfigAlert';
import StandardResourceQuotaAlert from '../components/StandardResourceQuotaAlert';
import { getQuotaListURL } from '../utils/url';
import { getAdditionalResourceKeys } from '../utils/utils';

import QuotaFormResourceLimitFields from './components/QuotaFormResourceLimitFields';
import useOnQuotaSubmit from './hooks/useOnQuotaSubmit';
import useOnQuotaUpdate from './hooks/useOnQuotaUpdate';

type QuotaFormEditorProps = {
  formData: ApplicationAwareResourceQuota;
  isEdit?: boolean;
  onChange?: (data: ApplicationAwareResourceQuota) => void;
};

const QuotaFormEditor: FCC<QuotaFormEditorProps> = ({ formData, isEdit = false, onChange }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const namespace = useNamespaceParam();
  const [error, setError] = useState<Error | null>(null);
  const onQuotaSubmit = useOnQuotaSubmit(setError, isEdit);
  const { updateHardValue, updateMetadata } = useOnQuotaUpdate(formData, onChange);

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
  const hasAdditionalResources = !isEmpty(getAdditionalResourceKeys(formData, 'fromSpec'));

  const submitButton = (
    <Button
      isAriaDisabled={!quotaName?.trim() || hasAdditionalResources}
      type="submit"
      variant="primary"
    >
      {isEdit ? t('Save') : t('Create quota')}
    </Button>
  );

  return (
    <PageSection>
      <Form maxWidth="900px" onSubmit={handleSubmit}>
        {hasAdditionalResources && <AdvancedConfigAlert isEdit={isEdit} quota={formData} />}
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
        <QuotaFormResourceLimitFields formData={formData} updateHardValue={updateHardValue} />
        {error && <ErrorAlert error={error} />}
        <Flex className="pf-v6-u-mt-lg" gap={{ default: 'gapMd' }}>
          {hasAdditionalResources ? (
            <Tooltip
              content={t(
                'Advanced configuration detected. Switch to the YAML view to review all settings and create this quota.',
              )}
            >
              {submitButton}
            </Tooltip>
          ) : (
            submitButton
          )}
          <Button onClick={() => navigate(getQuotaListURL(namespace))} variant="secondary">
            {t('Cancel')}
          </Button>
        </Flex>
      </Form>
    </PageSection>
  );
};

export default QuotaFormEditor;
