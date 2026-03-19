import React, { FC, ReactNode, useMemo } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonProps,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { CheckupType } from '../../utils/types';

import { getBodyText, getDocumentationURL, getLearnMoreText, getTitleText } from './utils';

type CheckupsEmptyState = {
  bottomFooterActions?: ReactNode;
  checkupType: CheckupType;
  isLoading: boolean;
  isPermitted: boolean;
  namespace: string;
  permissionsButtonProps: Pick<ButtonProps, 'isDisabled' | 'onClick'>;
  topFooterActions?: ReactNode;
};

const CheckupsEmptyState: FC<CheckupsEmptyState> = ({
  bottomFooterActions,
  checkupType,
  isLoading,
  isPermitted,
  namespace,
  permissionsButtonProps,
  topFooterActions,
}) => {
  const { t } = useKubevirtTranslation();
  const isAllNamespaces = namespace === ALL_NAMESPACES_SESSION_KEY;

  const bodyText = useMemo(
    () => getBodyText(checkupType, isAllNamespaces, isPermitted, t),
    [isAllNamespaces, isPermitted, t],
  );

  const { isDisabled, onClick } = permissionsButtonProps;

  return (
    <EmptyState
      className="checkups-empty-state"
      headingLevel="h4"
      icon={SearchIcon}
      titleText={getTitleText(checkupType, t)}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>{bodyText}</EmptyStateBody>
      <EmptyStateFooter>
        {topFooterActions}
        {!isAllNamespaces && (
          <EmptyStateActions>
            <Stack hasGutter>
              <StackItem>
                <Button
                  aria-describedby={
                    isDisabled && !isLoading ? 'permissions-button-helper' : undefined
                  }
                  isDisabled={isDisabled || isLoading}
                  isLoading={isLoading}
                  onClick={onClick}
                  variant={isLoading ? ButtonVariant.plain : ButtonVariant.secondary}
                >
                  {!isLoading && isPermitted ? t('Remove permissions') : t('Install permissions')}
                </Button>
              </StackItem>
              {isDisabled && !isLoading && (
                <StackItem>
                  <HelperText id="permissions-button-helper">
                    <HelperTextItem>
                      {t(
                        'Cluster-admin permissions required. Contact your cluster administrator for assistance.',
                      )}
                    </HelperTextItem>
                  </HelperText>
                </StackItem>
              )}
            </Stack>
          </EmptyStateActions>
        )}
        {bottomFooterActions}
        <EmptyStateActions>
          <ExternalLink href={getDocumentationURL()} text={getLearnMoreText(checkupType, t)} />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default CheckupsEmptyState;
