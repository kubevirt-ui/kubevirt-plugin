import React, { ReactElement } from 'react';
import { Trans } from 'react-i18next';
import { TFunction } from 'i18next';

export const CONFIRM_ACTIONS = {
  delete: 'delete',
  detach: 'detach',
  makePersistent: 'makePersistent',
} as const;

export type ConfirmAction = (typeof CONFIRM_ACTIONS)[keyof typeof CONFIRM_ACTIONS];

export const getActionMessages: Record<
  ConfirmAction,
  (t: TFunction, name: string) => ReactElement
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
      Are you sure you want to make <strong>{{ name }}</strong> persistent?
    </Trans>
  ),
};

export const getActionMessagesWithNamespace: Record<
  ConfirmAction,
  (t: TFunction, name: string, namespace: string) => ReactElement
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
      Are you sure you want to make <strong>{{ name }}</strong> persistent in namespace{' '}
      <strong>{{ namespace }}</strong>?
    </Trans>
  ),
};
