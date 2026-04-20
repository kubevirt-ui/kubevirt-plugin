import { TFunction } from 'i18next';
import React, { ReactElement } from 'react';
import { Trans } from 'react-i18next';

export const VM_ACTIONS = {
  pause: 'pause',
  reset: 'reset',
  restart: 'restart',
  stop: 'stop',
} as const;

export type VMAction = (typeof VM_ACTIONS)[keyof typeof VM_ACTIONS];

export const getVmActionMessages: Record<
  VMAction,
  (t: TFunction, name: string, namespace: string) => ReactElement
> = {
  [VM_ACTIONS.pause]: (t, name, namespace) => (
    <Trans t={t}>
      Are you sure you want to pause <strong>{{ name }}</strong> in namespace{' '}
      <strong>{{ namespace }}</strong>?
    </Trans>
  ),
  [VM_ACTIONS.reset]: (t, name, namespace) => (
    <Trans t={t}>
      Are you sure you want to reset <strong>{{ name }}</strong> in namespace{' '}
      <strong>{{ namespace }}</strong>?
    </Trans>
  ),
  [VM_ACTIONS.restart]: (t, name, namespace) => (
    <Trans t={t}>
      Are you sure you want to restart <strong>{{ name }}</strong> in namespace{' '}
      <strong>{{ namespace }}</strong>?
    </Trans>
  ),
  [VM_ACTIONS.stop]: (t, name, namespace) => (
    <Trans t={t}>
      Are you sure you want to stop <strong>{{ name }}</strong> in namespace{' '}
      <strong>{{ namespace }}</strong>?
    </Trans>
  ),
};

export const getVmActionTitles: Record<VMAction, (t: TFunction) => string> = {
  [VM_ACTIONS.pause]: (t) => t('Pause VirtualMachine?'),
  [VM_ACTIONS.reset]: (t) => t('Reset VirtualMachine?'),
  [VM_ACTIONS.restart]: (t) => t('Restart VirtualMachine?'),
  [VM_ACTIONS.stop]: (t) => t('Stop VirtualMachine?'),
};

export const getVmActionLabels: Record<VMAction, (t: TFunction) => string> = {
  [VM_ACTIONS.pause]: (t) => t('Pause'),
  [VM_ACTIONS.reset]: (t) => t('Reset'),
  [VM_ACTIONS.restart]: (t) => t('Restart'),
  [VM_ACTIONS.stop]: (t) => t('Stop'),
};
