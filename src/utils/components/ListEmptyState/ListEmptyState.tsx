import React, { ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

import ExternalLink from '../ExternalLink/ExternalLink';

import ListErrorState from './ListErrorState';
import ListSkeleton from './ListSkeleton';

type ListEmptyStateProps<T> = {
  canCreate?: boolean;
  children: ReactNode;
  createButtonAction?: ReactNode;
  createButtonlink?: string;
  data: T[];
  error: any;
  kind: string;
  learnMoreLink: string;
  loaded: boolean;
  onCreate?: () => void;
  title?: string;
};

const ListEmptyState = <T extends K8sResourceCommon>({
  canCreate = true,
  children,
  createButtonAction,
  createButtonlink,
  data,
  error,
  kind,
  learnMoreLink,
  loaded,
  onCreate,
  title,
}: ListEmptyStateProps<T>) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const params = useParams();

  if (error) return <ListErrorState error={error} title={title} />;

  if (!loaded)
    return (
      <>
        {title && <ListPageHeader title={title} />}
        <ListSkeleton />
      </>
    );

  if (!isEmpty(data)) return <>{children}</>;

  const defaultCreateButton = (
    <Button
      onClick={
        onCreate
          ? onCreate
          : () =>
              navigate(
                params?.ns
                  ? createButtonlink
                  : `/k8s/ns/default/${params.plural}/${createButtonlink}`,
              )
      }
      variant={ButtonVariant.primary}
    >
      {t('Create {{ kind }}', { kind })}
    </Button>
  );

  return (
    <>
      {title && <ListPageHeader title={title} />}
      <EmptyState
        headingLevel="h4"
        icon={AddCircleOIcon}
        titleText={t('No {{kind}} found', { kind })}
      >
        {canCreate && (
          <EmptyStateBody>
            <Trans t={t}>
              Click <b>Create {{ kind }}</b> to create your first {{ kind }}
            </Trans>
          </EmptyStateBody>
        )}
        <EmptyStateFooter>
          {canCreate && (
            <EmptyStateActions>{createButtonAction || defaultCreateButton}</EmptyStateActions>
          )}
          <EmptyStateActions>
            <ExternalLink href={learnMoreLink}>
              {t('Learn more about {{ kind }}', { kind })}
            </ExternalLink>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    </>
  );
};

export default ListEmptyState;
