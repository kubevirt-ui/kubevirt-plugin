import * as React from 'react';
import { dump, load } from 'js-yaml';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertActionCloseButton, Stack } from '@patternfly/react-core';

import './CloudInitEditor.scss';

type CloudInitEditorProps = {
  cloudInitVolume: V1Volume;
  updateVM: (newVM: V1VirtualMachine) => void | ((vmDraft: V1VirtualMachine) => void);
  vm: V1VirtualMachine;
};

const EDITOR_TOOLS_SPACES = 75;

export const _CloudInitEditor: React.FC<CloudInitEditorProps> = ({
  cloudInitVolume,
  updateVM,
  vm,
}) => {
  const cloudInitData = cloudInitVolume?.cloudInitNoCloud || cloudInitVolume?.cloudInitConfigDrive;

  const { t } = useKubevirtTranslation();
  const [error, setError] = React.useState<any>();
  const [editorHeight, setEditorHeight] = React.useState<number>();
  const [success, setSuccess] = React.useState<any>();
  const yamlEditorRef = React.useRef<HTMLDivElement>();

  const onSave = React.useCallback(
    (yaml: string) => {
      const updatedVM = produceVMDisks(vm, (vmDraft) => {
        const cloudInitDiskName = cloudInitVolume?.name || 'cloudinitdisk';
        const cloudInitDisk = vmDraft.spec.template.spec.domain.devices.disks.find(
          (disk) => disk.name === cloudInitDiskName,
        );

        // cloudinitdisk deleted or doesn't exist, we need to re-create it
        if (!cloudInitDisk) {
          vmDraft.spec.template.spec.domain.devices.disks.push({
            name: cloudInitDiskName,
            disk: {
              bus: 'virtio',
            },
          });
        }

        const updatedCloudinitVolume = {
          name: cloudInitDiskName,
          cloudInitNoCloud: load(yaml),
        };

        const otherVolumes = getVolumes(vmDraft).filter((vol) => !vol.cloudInitNoCloud);
        vmDraft.spec.template.spec.volumes = [...otherVolumes, updatedCloudinitVolume];
      });

      updateVM(updatedVM);
    },
    [cloudInitVolume?.name, updateVM, vm],
  );

  const onSaveClick = async (yaml: string) => {
    try {
      await onSave(yaml);
      setSuccess(t('Successfully updated the VM'));
      setError(undefined);
    } catch (onSaveError) {
      setError(onSaveError);
    }
  };

  React.useLayoutEffect(() => {
    if (yamlEditorRef.current?.clientHeight) {
      setEditorHeight(yamlEditorRef.current?.clientHeight - EDITOR_TOOLS_SPACES);
    }
  }, []);

  return (
    <div className="yaml-container">
      <div className="cloud-init-editor" ref={yamlEditorRef}>
        {editorHeight && (
          <ResourceYAMLEditor initialResource={dump(cloudInitData)} onSave={onSaveClick} />
        )}
      </div>
      <Stack hasGutter>
        {error && (
          <Alert
            isInline
            className="co-alert co-alert--scrollable"
            variant="danger"
            title={t('An error occurred')}
            actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
          >
            <div className="co-pre-line">{error.message}</div>
          </Alert>
        )}
        {success && (
          <Alert
            isInline
            className="co-alert"
            variant="success"
            title={success}
            actionClose={<AlertActionCloseButton onClose={() => setSuccess(false)} />}
          />
        )}
      </Stack>
    </div>
  );
};
