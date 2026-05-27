import React, { FC } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  pluralize,
  Popover,
} from '@patternfly/react-core';

type NamespaceCheckerAlertProps = {
  namespacesLoaded: boolean;
  qualifiedNamespaces: K8sResourceKind[];
};

const NamespaceCheckerAlert: FC<NamespaceCheckerAlertProps> = ({
  namespacesLoaded,
  qualifiedNamespaces = [],
}) => {
  const { t } = useKubevirtTranslation();
  if (!namespacesLoaded) {
    return <Loading />;
  }

  const numQualifiedNamespaces = qualifiedNamespaces?.length;
  const matchingNamespaceText = pluralize(numQualifiedNamespaces, 'Namespace');

  return (
    <Alert
      title={
        <>
          {numQualifiedNamespaces ? (
            <>
              {t('{{matchingNamespaceText}} matching', {
                matchingNamespaceText: matchingNamespaceText,
              })}
            </>
          ) : (
            t('No matching Namespaces found for the labels')
          )}
        </>
      }
      isInline
      variant={numQualifiedNamespaces ? AlertVariant.success : AlertVariant.warning}
    >
      {numQualifiedNamespaces ? (
        <Popover
          bodyContent={
            <>
              {qualifiedNamespaces?.map((namespace) => (
                <Flex key={namespace.metadata.uid}>
                  <FlexItem spacer={{ default: 'spacerXs' }}>
                    <MulticlusterResourceLink
                      cluster={getCluster(namespace)}
                      groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
                      name={getName(namespace)}
                    />
                  </FlexItem>
                </Flex>
              ))}
            </>
          }
          headerContent={
            <>
              {t('{{qualifiedNamespacesCount}} matching Namespaces found', {
                qualifiedNamespacesCount: numQualifiedNamespaces,
              })}
            </>
          }
        >
          <Button isInline variant={ButtonVariant.link}>
            {t('View matching {{matchingNamespaceText}}', { matchingNamespaceText })}
          </Button>
        </Popover>
      ) : (
        t('Scheduling will not be possible at this state')
      )}
    </Alert>
  );
};

export default NamespaceCheckerAlert;
