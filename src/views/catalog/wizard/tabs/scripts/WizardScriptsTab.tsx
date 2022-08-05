import * as React from 'react';
import { Trans } from 'react-i18next';

import { ensurePath, produceVMSSHKey } from '@catalog/utils/WizardVMContext';
import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { WizardTab } from '@catalog/wizard/tabs';
import { AuthorizedSSHKeyModal } from '@kubevirt-utils/components/AuthorizedSSHKeyModal/AuthorizedSSHKeyModal';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import { CloudinitModal } from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { addSecretToVM } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { SysprepModal } from '@kubevirt-utils/components/SysprepModal/SysprepModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  Divider,
  Grid,
  GridItem,
  Stack,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import { SysprepDescription } from './components/SysprepDescription';

import './WizardScriptsTab.scss';

const WizardScriptsTab: WizardTab = ({ vm, updateVM, tabsData, updateTabsData }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const sshKey = tabsData?.scripts?.cloudInit?.sshKey;
  const vmAttachedSecretName = vm?.spec?.template?.spec?.accessCredentials?.find(
    (ac) => ac?.sshPublicKey?.source?.secret?.secretName,
  )?.sshPublicKey?.source?.secret?.secretName;

  const unattend = tabsData?.scripts?.sysprep?.unattended;
  const autoUnattend = tabsData?.scripts?.sysprep?.autounattend;
  const selectedSysprep = tabsData?.scripts?.sysprep?.selectedSysprep;

  const onSysprepSelected = (newSysprep: string) =>
    updateTabsData((tabsDraft) => {
      ensurePath(tabsDraft, 'scripts.sysprep');
      if (newSysprep) {
        tabsDraft.scripts.sysprep.selectedSysprep = newSysprep;
        delete tabsDraft.scripts.sysprep.unattended;
        delete tabsDraft.scripts.sysprep.autounattend;
      } else {
        delete tabsDraft.scripts.sysprep.selectedSysprep;
      }
    });

  const onSysprepCreation = (unattended: string, autounattend: string) =>
    updateTabsData((tabsDraft) => {
      ensurePath(tabsDraft, 'scripts.sysprep');
      tabsDraft.scripts.sysprep.autounattend = autounattend;
      tabsDraft.scripts.sysprep.unattended = unattended;

      if (unattended || autounattend) {
        delete tabsDraft.scripts.sysprep.selectedSysprep;
      }
    });

  const onSSHChange = (secretName: string, value?: string) => {
    updateTabsData((tabsDraft) => {
      ensurePath(tabsDraft, 'scripts.cloudInit');

      if (value) {
        tabsDraft.scripts.cloudInit.sshKey = value;
      } else {
        delete tabsDraft.scripts.cloudInit.sshKey;
      }
    });

    if (value) {
      return updateVM((vmDraft) => {
        const produced = produceVMSSHKey(vmDraft);
        vmDraft.spec = produced.spec;
      });
    } else if (secretName) {
      return updateVM((vmDraft) => {
        return addSecretToVM(vmDraft, secretName);
      });
    } else {
      return updateVM((vmDraft) => {
        vmDraft.spec.template.spec.accessCredentials = null;
      });
    }
  };

  return (
    <div className="co-m-pane__body">
      <Grid hasGutter>
        <GridItem span={5} rowSpan={4}>
          <DescriptionList>
            <WizardDescriptionItem
              testId="wizard-cloudinit"
              title={t('Cloud-init')}
              description={<CloudInitDescription vm={vm} />}
              isEdit
              showEditOnTitle
              onEditClick={() =>
                createModal((modalProps) => (
                  <CloudinitModal {...modalProps} vm={vm} onSubmit={updateVM} />
                ))
              }
            />
            <Divider />
            <WizardDescriptionItem
              testId="wizard-sshkey"
              title={t('Authorized SSH Key')}
              isEdit
              showEditOnTitle
              description={
                <Stack hasGutter>
                  <div data-test="ssh-popover">
                    <Trans t={t} ns="plugin__kubevirt-plugin">
                      <Text component={TextVariants.p}>Store the key in a project secret.</Text>
                      <Text component={TextVariants.p}>
                        The key will be stored after the machine is created
                      </Text>
                    </Trans>
                  </div>
                  <span>
                    {sshKey || vmAttachedSecretName ? t('Available') : t('Not available')}
                  </span>
                </Stack>
              }
              onEditClick={() =>
                createModal((modalProps) => (
                  <AuthorizedSSHKeyModal
                    {...modalProps}
                    sshKey={sshKey}
                    vmSecretName={vmAttachedSecretName}
                    onSubmit={onSSHChange}
                  />
                ))
              }
            />
            <Divider />
            <WizardDescriptionItem
              testId="wizard-sysprep"
              title={t('Sysprep')}
              description={
                <SysprepDescription
                  hasAutoUnattend={!!autoUnattend}
                  hasUnattend={!!unattend}
                  selectedSysprepName={selectedSysprep}
                />
              }
              isEdit
              showEditOnTitle
              onEditClick={() =>
                createModal((modalProps) => (
                  <SysprepModal
                    {...modalProps}
                    unattend={unattend}
                    autoUnattend={autoUnattend}
                    onSysprepCreation={onSysprepCreation}
                    onSysprepSelected={onSysprepSelected}
                    sysprepSelected={selectedSysprep}
                  />
                ))
              }
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default WizardScriptsTab;
