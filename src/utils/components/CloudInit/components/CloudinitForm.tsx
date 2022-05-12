import * as React from 'react';
import produce from 'immer';
import { dump, load } from 'js-yaml';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { Loading } from '@patternfly/quickstarts';
import { Bullseye, Form, FormGroup, TextInput } from '@patternfly/react-core';

import { CloudInitDataFormKeys, CloudInitDataHelper } from '../utils/cloud-init-data-helper';
import { cloudinitIDGenerator } from '../utils/cloudint-utils';
import useCloudinitValidations from '../utils/use-cloudinit-validations';

import CloudinitSSHKeyForm from './CloudinitSSHKeyForm/CloudInitSSHKeyForm';
import CloudInitEditor from './CloudInitEditor';
import { CloudinitNetworkForm } from './CloudInitNetworkForm';

type CloudinitFormProps = {
  cloudInitVolume: V1Volume;
  showEditor: boolean;
  updateVM: (newVM: V1VirtualMachine) => void;
  vm: V1VirtualMachine;
  setSSHKey: (sshKey: string) => void;
  sshKey: string;
};

const CloudinitForm: React.FC<CloudinitFormProps> = ({
  cloudInitVolume,
  showEditor,
  vm,
  updateVM,
  setSSHKey,
  sshKey,
}) => {
  const { t } = useKubevirtTranslation();
  const cloudInitData = React.useMemo(
    () => cloudInitVolume?.cloudInitNoCloud || cloudInitVolume?.cloudInitConfigDrive,
    [cloudInitVolume],
  );

  const [cloudinitConfigUserData, isBase64] = React.useMemo(
    () => CloudInitDataHelper.getUserData(cloudInitData || {}),
    [cloudInitData],
  );

  const cloudinitConfigDataHelper = React.useMemo(
    () => new CloudInitDataHelper({ userData: cloudinitConfigUserData || '' }),
    [cloudinitConfigUserData],
  );

  const { validationSchema, validationStatus, isValid } = useCloudinitValidations();
  const [yaml, setYAML] = React.useState<string>(cloudinitConfigDataHelper.getUserData());

  const yamlAsJS = React.useMemo(() => {
    try {
      return load(yaml) as { [key: string]: string | string[] };
    } catch (e) {
      return {};
    }
  }, [yaml]);

  const onFieldChange = (field: string, value: string | string[]) => {
    setYAML((data) => {
      try {
        const loadedYaml: any = load(data);

        if (value) {
          loadedYaml[field] = value;
        } else {
          delete loadedYaml[field];
        }

        return dump(loadedYaml);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e?.message);
      }
      return data;
    });
  };

  const _updateVM = React.useCallback(
    (newVM: V1VirtualMachine) => {
      if (!sshKey) updateVM(newVM);

      const vmChangedCloudType = produce(newVM, (draftVM) => {
        const cloudInitNoCloudVolume = draftVM.spec.template.spec.volumes?.find(
          (v) => v.cloudInitNoCloud,
        );
        if (cloudInitNoCloudVolume) {
          draftVM.spec.template.spec.volumes = draftVM.spec.template.spec.volumes.filter(
            (v) => v.name !== cloudInitNoCloudVolume.name,
          );
          draftVM.spec.template.spec.volumes.push({
            cloudInitConfigDrive: { ...cloudInitNoCloudVolume.cloudInitNoCloud },
            name: cloudInitNoCloudVolume.name,
          });
        }
      });

      updateVM(vmChangedCloudType);
    },
    [sshKey, updateVM],
  );

  const onUpdateVM = React.useCallback(() => {
    const newVM = produceVMDisks(vm, (vmDraft) => {
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
        cloudInitNoCloud: {
          ...(cloudInitData || {}),
          ...CloudInitDataHelper.toCloudInitNoCloudUserSource(yaml, isBase64),
        },
        name: cloudInitDiskName,
      };

      const otherVolumes = getVolumes(vmDraft).filter((vol) => !vol.cloudInitNoCloud);
      vmDraft.spec.template.spec.volumes = [...otherVolumes, updatedCloudinitVolume];
    });
    _updateVM(newVM);
  }, [cloudInitData, cloudInitVolume?.name, isBase64, _updateVM, vm, yaml]);

  React.useEffect(() => {
    try {
      validationSchema({
        user: yamlAsJS.user,
        password: yamlAsJS.password,
        hostname: yamlAsJS.hostname,
        ssh_authorized_keys: yamlAsJS.ssh_authorized_keys,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e?.message);
    }
  }, [validationSchema, yamlAsJS]);

  React.useEffect(() => {
    if (yaml && isValid && yaml !== cloudinitConfigDataHelper.getUserData()) {
      onUpdateVM();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yaml, isValid]);

  return (
    <>
      {showEditor ? (
        <React.Suspense
          fallback={
            <Bullseye>
              <Loading />
            </Bullseye>
          }
        >
          <CloudInitEditor cloudInitVolume={cloudInitVolume} vm={vm} updateVM={_updateVM} />
        </React.Suspense>
      ) : (
        <Form>
          <FormGroup
            label={t('User')}
            fieldId={cloudinitIDGenerator(CloudInitDataFormKeys.USER)}
            className="kv-cloudint-advanced-tab--validation-text"
            helperTextInvalid={validationStatus?.user?.message}
            helperText={t(
              'Please provide default username. Username must be valid username for the OS.',
            )}
            validated={validationStatus?.user?.type}
            isRequired
          >
            <TextInput
              type="text"
              id={cloudinitIDGenerator(CloudInitDataFormKeys.USER)}
              value={(yamlAsJS?.user as string) || ''}
              onChange={(v) => onFieldChange(CloudInitDataFormKeys.USER, v)}
            />
          </FormGroup>
          <FormGroup
            label={t('Password')}
            fieldId={cloudinitIDGenerator(CloudInitDataFormKeys.PASSWORD)}
            className="kv-cloudint-advanced-tab--validation-text"
            helperTextInvalid={validationStatus?.password?.message}
            helperText={t('Please provide password for username.')}
            validated={validationStatus?.password?.type}
          >
            <TextInput
              type="text"
              id={cloudinitIDGenerator(CloudInitDataFormKeys.PASSWORD)}
              value={(yamlAsJS?.password as string) || ''}
              onChange={(v) => onFieldChange(CloudInitDataFormKeys.PASSWORD, v)}
            />
          </FormGroup>
          <FormGroup
            label={t('Hostname')}
            fieldId={cloudinitIDGenerator(CloudInitDataFormKeys.HOSTNAME)}
            className="kv-cloudint-advanced-tab--validation-text"
            helperTextInvalid={validationStatus?.hostname?.message}
            helperText={t('Please provide hostname.')}
            validated={validationStatus?.hostname?.type}
          >
            <TextInput
              value={(yamlAsJS?.hostname as string) || ''}
              type="text"
              id={cloudinitIDGenerator(CloudInitDataFormKeys.HOSTNAME)}
              onChange={(v) => onFieldChange(CloudInitDataFormKeys.HOSTNAME, v)}
            />
          </FormGroup>
          <CloudinitNetworkForm cloudInitVolume={cloudInitVolume} updateVM={_updateVM} vm={vm} />{' '}
        </Form>
      )}
      <Form className="kv-cloudinit--ssh-form">
        <FormGroup
          label={t('Authorized SSH Key')}
          fieldId={cloudinitIDGenerator(CloudInitDataFormKeys.SSH_AUTHORIZED_KEYS)}
          className="kv-cloudint-advanced-tab--validation-text"
        >
          <CloudinitSSHKeyForm
            id={cloudinitIDGenerator(CloudInitDataFormKeys.SSH_AUTHORIZED_KEYS)}
            value={sshKey}
            onChange={setSSHKey}
          />
        </FormGroup>
      </Form>
    </>
  );
};

export default CloudinitForm;
