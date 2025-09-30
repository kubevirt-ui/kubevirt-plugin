import React, { Dispatch, FC, SetStateAction } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import { modelToRef } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigPlanModel,
} from '@kubevirt-utils/resources/migrations/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, List, ListItem } from '@patternfly/react-core';
import VirtualMachineMigrationDetailsTab from '@virtualmachines/actions/components/VirtualMachineMigration/components/tabs/VirtualMachineMigrationDetailsTab';

type VMMigrationNamespaceConflictsAlertProps = {
  loaded: boolean;
  namespaceConflicts: string[];
  onClose: () => Promise<void> | void;
  scLoaded: boolean;
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setSelectedPVCs: Dispatch<SetStateAction<IoK8sApiCoreV1PersistentVolumeClaim[]>>;
  vms: V1VirtualMachine[];
  vmsPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
};

const VMMigrationNamespaceConflictsAlert: FC<VMMigrationNamespaceConflictsAlertProps> = ({
  loaded,
  namespaceConflicts,
  onClose,
  scLoaded,
  selectedPVCs,
  setSelectedPVCs,
  vms,
  vmsPVCs,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {!isEmpty(namespaceConflicts) && (
        <Alert
          title={
            namespaceConflicts.length === 1
              ? t('An existing MigPlan was found in the {{namespace}} namespace.', {
                  namespace: namespaceConflicts[0],
                })
              : t('An existing MigPlan for these namespaces was found.')
          }
          variant={AlertVariant.danger}
        >
          {namespaceConflicts.length > 1 && (
            <List className="pf-v6-u-my-sm">
              {namespaceConflicts.map((ns) => (
                <ListItem key={ns}>{ns}</ListItem>
              ))}
            </List>
          )}
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            Click{' '}
            <Link
              onClick={onClose}
              to={`/k8s/ns/${DEFAULT_MIGRATION_NAMESPACE}/${modelToRef(MigPlanModel)}`}
            >
              {t('Storage Migrations')}
            </Link>{' '}
            to review and delete existing MigPlans.
          </Trans>
        </Alert>
      )}

      {isEmpty(namespaceConflicts) && loaded && scLoaded && (
        <VirtualMachineMigrationDetailsTab
          pvcs={vmsPVCs}
          selectedPVCs={selectedPVCs}
          setSelectedPVCs={setSelectedPVCs}
          vms={vms}
        />
      )}

      {(!loaded || !scLoaded) && <Loading />}
    </>
  );
};

export default VMMigrationNamespaceConflictsAlert;
