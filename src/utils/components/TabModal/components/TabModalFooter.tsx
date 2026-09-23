import { type FC, type MouseEvent, type ReactNode } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import HidableTooltip from '@kubevirt-utils/components/HidableTooltip/HidableTooltip';
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
  submitDisabledTooltip?: ReactNode;
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
  submitDisabledTooltip,
}) => {
  const { t } = useKubevirtTranslation();

  const errorMessage = error ? formatK8sError(error, t) : '';
  const errorHref = error ? getK8sErrorHref(error) : undefined;
  const showSubmitTooltip = Boolean(isDisabled && submitDisabledTooltip && !isSubmitting);

  const handleSaveClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    if (!shouldWrapInForm) {
      executeSubmit();
    }
  };

  const saveButton = (
    <Button
      data-test="save-button"
      form="tab-modal-form"
      isAriaDisabled={showSubmitTooltip}
      isDisabled={(isDisabled || isSubmitting) && !showSubmitTooltip}
      isLoading={isLoading || isSubmitting}
      onClick={handleSaveClick}
      type={isDisabled ? 'button' : 'submit'}
      variant={submitBtnVariant ?? ButtonVariant.primary}
    >
      {submitBtnText ?? t('Save')}
    </Button>
  );

  return (
    <ModalFooter>
      <Stack className="kv-tabmodal-footer" hasGutter>
        {error && (
          <StackItem>
            <Alert
              data-test="modal-error-alert"
              isInline
              title={t('An error occurred')}
              variant={AlertVariant.danger}
            >
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
          <HidableTooltip content={submitDisabledTooltip} hidden={!showSubmitTooltip}>
            {saveButton}
          </HidableTooltip>
          <Button
            data-test="cancel-button"
            onClick={() => {
              Promise.resolve()
                .then(() => (onCancel ?? onClose)())
                .catch(kubevirtConsole.error);
            }}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
            variant={cancelBtnVariant ?? ButtonVariant.link}
          >
            {cancelBtnText ?? t('Cancel')}
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
