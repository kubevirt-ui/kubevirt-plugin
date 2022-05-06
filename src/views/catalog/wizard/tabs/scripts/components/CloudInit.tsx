import * as React from 'react';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { Bullseye, Radio, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import CloudInitEditor from './CloudInitEditor';
import CloudinitForm from './CloudinitForm';
import CloudInitInfoHelper from './CloudinitInfoHelper';

import './cloud-init.scss';

type CloudinitProps = {
  vm: V1VirtualMachine;
  updateVM: UpdateValidatedVM;
  loaded: boolean;
};

const Cloudinit: React.FC<CloudinitProps> = ({ vm, loaded }) => {
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
        {showEditor ? (
          <React.Suspense
            fallback={
              <Bullseye>
                <Loading />
              </Bullseye>
            }
          >
            <CloudInitEditor cloudInitVolume={cloudInitVolume} />
          </React.Suspense>
        ) : (
          <CloudinitForm cloudInitVolume={cloudInitVolume} />
        )}
      </div>
    </Stack>
  );
};

export default Cloudinit;
