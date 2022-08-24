import * as React from 'react';

import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { WizardTab } from '@catalog/wizard/tabs';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import { CloudinitModal } from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, Divider, Grid, GridItem } from '@patternfly/react-core';

import SSHKey from './components/SSHKey';
import Sysprep from './components/Sysprep';

import './WizardScriptsTab.scss';

const WizardScriptsTab: WizardTab = ({ vm, updateVM }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

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
            <SSHKey />
            <Divider />
            <Sysprep />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default WizardScriptsTab;
