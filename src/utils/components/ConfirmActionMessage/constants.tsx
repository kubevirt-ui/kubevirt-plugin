import React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const CONFIRM_ACTIONS = {
  delete: 'delete',
  detach: 'detach',
  makePersistent: 'makePersistent',
} as const;

export type ConfirmAction = (typeof CONFIRM_ACTIONS)[keyof typeof CONFIRM_ACTIONS];

export type TFunction = ReturnType<typeof useKubevirtTranslation>['t'];

export const actionMessages: Record<
  ConfirmAction,
  (t: TFunction, name: string) => React.ReactElement
> = {
  [CONFIRM_ACTIONS.delete]: (t, name) => (
    <Trans t={t}>
      Are you sure you want to delete <strong>{{ name }}</strong>?
    </Trans>
  ),
  [CONFIRM_ACTIONS.detach]: (t, name) => (
    <Trans t={t}>
      Are you sure you want to detach <strong>{{ name }}</strong>?
    </Trans>
  ),
  [CONFIRM_ACTIONS.makePersistent]: (t, name) => (
    <Trans t={t}>
      Are you sure you want to make persistent <strong>{{ name }}</strong>?
    </Trans>
  ),
};

export const actionMessagesWithNamespace: Record<
  ConfirmAction,
  (t: TFunction, name: string, namespace: string) => React.ReactElement
> = {
  [CONFIRM_ACTIONS.delete]: (t, name, namespace) => (
    <Trans t={t}>
      Are you sure you want to delete <strong>{{ name }}</strong> in namespace{' '}
      <strong>{{ namespace }}</strong>?
    </Trans>
  ),
  [CONFIRM_ACTIONS.detach]: (t, name, namespace) => (
    <Trans t={t}>
      Are you sure you want to detach <strong>{{ name }}</strong> in namespace{' '}
      <strong>{{ namespace }}</strong>?
    </Trans>
  ),
  [CONFIRM_ACTIONS.makePersistent]: (t, name, namespace) => (
    <Trans t={t}>
      Are you sure you want to make persistent <strong>{{ name }}</strong> in namespace{' '}
      <strong>{{ namespace }}</strong>?
    </Trans>
  ),
};
