import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceResources from '@kubevirt-utils/hooks/useNamespaceResources';
import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  List,
  ListItem,
  Popover,
} from '@patternfly/react-core';

import { getVMNetworkNamespaces } from '../../utils';
import { VMNetworkForm } from '../constants';

const SelectedNamespaces: FC = () => {
  const { t } = useKubevirtTranslation();

  const { watch } = useFormContext<VMNetworkForm>();

  const vmNetwork = watch('network');

  const [namespaces] = useNamespaceResources();

  const matchingNamespaces = getVMNetworkNamespaces(vmNetwork, namespaces);
  const namespacesCount = matchingNamespaces.length;

  return (
    <Alert
      title={
        namespacesCount === 1
          ? t('1 namespace selected')
          : t('{{namespacesCount}} namespaces selected', { namespacesCount: namespacesCount })
      }
      variant={namespacesCount === 0 ? AlertVariant.warning : AlertVariant.success}
    >
      {namespacesCount === 0 ? (
        t('No namespaces selected')
      ) : (
        <Popover
          bodyContent={
            <List>
              {matchingNamespaces?.map((ns) => (
                <ListItem key={getName(ns)}>
                  <ResourceIcon groupVersionKind={modelToGroupVersionKind(NamespaceModel)} />
                  {getName(ns)}
                </ListItem>
              ))}
            </List>
          }
        >
          <Button isInline variant={ButtonVariant.link}>
            {t('View selected namespaces')}
          </Button>
        </Popover>
      )}
    </Alert>
  );
};

export default SelectedNamespaces;
