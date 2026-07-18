import React, { FC, ReactNode } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { formatK8sError, getK8sErrorHref } from '@kubevirt-utils/utils/formatK8sError';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  ModalFooter,
  Stack,
  StackItem,
} from '@patternfly/react-core';

type TabModalFooterProps = {
  actionItemLink?: ReactNode;
  cancelBtnText?: string;
  cancelBtnVariant?: ButtonVariant;
  error?: Error;
  executeSubmit: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  isSubmitting: boolean;
  onCancel?: () => Promise<void> | void;
  onClose: () => Promise<void> | void;
  shouldWrapInForm?: boolean;
  submitBtnText?: string;
  submitBtnVariant?: ButtonVariant;
};

const TabModalFooter: FC<TabModalFooterProps> = ({
  actionItemLink,
  cancelBtnText,
  cancelBtnVariant,
  error,
  executeSubmit,
  isDisabled,
  isLoading,
  isSubmitting,
  onCancel,
  onClose,
  shouldWrapInForm,
  submitBtnText,
  submitBtnVariant,
}) => {
  const { t } = useKubevirtTranslation();

  const errorMessage = error ? formatK8sError(error, t) : '';
  const rawHref = error ? getK8sErrorHref(error) : undefined;
  const errorHref = rawHref && /^https?:\/\//i.test(rawHref) ? rawHref : undefined;

  return (
    <ModalFooter>
      <Stack className="kv-tabmodal-footer" hasGutter>
        {error && (
          <StackItem>
            <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
              <Stack hasGutter>
                <StackItem>{errorMessage}</StackItem>
                {errorHref && (
                  <StackItem>
                    <ExternalLink href={errorHref} text={t('Open link to resolve the issue')} />
                  </StackItem>
                )}
              </Stack>
            </Alert>
          </StackItem>
        )}
        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
          <Button
            ouiaId="save-button"
            form="tab-modal-form"
            isDisabled={isDisabled || isSubmitting}
            isLoading={isLoading || isSubmitting}
            onClick={shouldWrapInForm ? undefined : executeSubmit}
            type="submit"
            variant={submitBtnVariant ?? ButtonVariant.primary}
          >
            {submitBtnText || t('Save')}
          </Button>
          <Button
            onClick={() => {
              void Promise.resolve()
                .then(() => (onCancel ?? onClose)())
                .catch(kubevirtConsole.error);
            }}
            ouiaId="cancel-button"
            variant={cancelBtnVariant ?? ButtonVariant.link}
          >
            {cancelBtnText || t('Cancel')}
          </Button>
          {actionItemLink && (
            <div className="kv-tabmodal-footer__action-item-link">{actionItemLink}</div>
          )}
        </Flex>
      </Stack>
    </ModalFooter>
  );
};

export default TabModalFooter;
