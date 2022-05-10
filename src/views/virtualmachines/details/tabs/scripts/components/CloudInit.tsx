import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { Radio, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import CloudinitForm from './CloudinitForm';
import CloudInitInfoHelper from './CloudinitInfoHelper';

import './cloud-init.scss';

type CloudinitProps = {
  vm: V1VirtualMachine;
  updateVM: (updateVM: V1VirtualMachine) => void;
  loaded: boolean;
};

const Cloudinit: React.FC<CloudinitProps> = ({ vm, loaded, updateVM }) => {
  const { t } = useKubevirtTranslation();
  const [showEditor, setShowEditor] = React.useState(false);
  const cloudInitVolume = getVolumes(vm)?.find(
    (vol) => !!vol.cloudInitNoCloud || !!vol.cloudInitConfigDrive,
  );

  return (
    <Stack hasGutter>
      <CloudInitInfoHelper />
      <StackItem className="kv-cloudinit--radio">
        <Split hasGutter>
          <SplitItem>
            <strong>{t('Configure via:')}</strong>
          </SplitItem>
          <SplitItem>
            <Radio
              label={t('Form view')}
              id="form-radio"
              name={'form-radio'}
              aria-label={'form-radio'}
              isChecked={!showEditor}
              isDisabled={!loaded}
              onChange={() => setShowEditor(false)}
            />
          </SplitItem>
          <SplitItem>
            <Radio
              label={t('Script')}
              id="editor-radio"
              name={'editor-radio'}
              aria-label={'editor-radio'}
              isChecked={showEditor}
              isDisabled={!loaded}
              onChange={() => setShowEditor(true)}
            />
          </SplitItem>
        </Split>
      </StackItem>
      <div className="kv-cloudinit-advanced-tab--main">
        <CloudinitForm
          showEditor={showEditor}
          cloudInitVolume={cloudInitVolume}
          vm={vm}
          updateVM={updateVM}
        />
      </div>
    </Stack>
  );
};

export default Cloudinit;
