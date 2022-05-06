import * as React from 'react';
import { dump, load } from 'js-yaml';

import { ensurePath, produceVMDisks, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DebouncedTextInput } from '@kubevirt-utils/components/DebouncedTextInput/DebouncedTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { Form, FormGroup } from '@patternfly/react-core';

import { CloudInitDataFormKeys, CloudInitDataHelper } from '../utils/cloud-init-data-helper';
import { cloudinitIDGenerator } from '../utils/cloudint-utils';
import useCloudinitValidations from '../utils/use-cloudinit-validations';

import CloudinitSSHKeyForm from './CloudinitSSHKeyForm/CloudInitSSHKeyForm';
import { CloudinitNetworkForm } from './CloudInitNetworkForm';

type CloudinitFormProps = {
  cloudInitVolume: V1Volume;
};
const CloudinitForm: React.FC<CloudinitFormProps> = ({ cloudInitVolume }) => {
  const { t } = useKubevirtTranslation();
  const { updateVM, tabsData, updateTabsData } = useWizardVMContext();
  const cloudInitData = cloudInitVolume?.cloudInitNoCloud || cloudInitVolume?.cloudInitConfigDrive;

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

        return dump({
          ...loadedYaml,
          [field]: value,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e?.message);
      }
      return data;
    });
  };

  const onSSHKeyChange = (sshKey: string) => {
    updateTabsData((tabDataDraft) => {
      ensurePath(tabDataDraft, 'scripts.cloudInit');
      tabDataDraft.scripts.cloudInit.sshKey = sshKey;
    });
  };

  const onUpdateVM = React.useCallback(
    () =>
      updateVM((vmToUpdate) =>
        produceVMDisks(vmToUpdate, (vmDraft) => {
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
            cloudInitNoCloud: {
              ...(cloudInitData || {}),
              ...CloudInitDataHelper.toCloudInitNoCloudUserSource(yaml, isBase64),
            },
          };

          const otherVolumes = getVolumes(vmDraft).filter((vol) => !vol.cloudInitNoCloud);
          vmDraft.spec.template.spec.volumes = [...otherVolumes, updatedCloudinitVolume];
        }),
      ),
    [cloudInitData, cloudInitVolume?.name, isBase64, updateVM, yaml],
  );

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
        <DebouncedTextInput
          type="text"
          id={cloudinitIDGenerator(CloudInitDataFormKeys.USER)}
          initialValue={(yamlAsJS?.user as string) || ''}
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
        <DebouncedTextInput
          type="text"
          id={cloudinitIDGenerator(CloudInitDataFormKeys.PASSWORD)}
          initialValue={(yamlAsJS?.password as string) || ''}
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
        <DebouncedTextInput
          initialValue={(yamlAsJS?.hostname as string) || ''}
          type="text"
          id={cloudinitIDGenerator(CloudInitDataFormKeys.HOSTNAME)}
          onChange={(v) => onFieldChange(CloudInitDataFormKeys.HOSTNAME, v)}
        />
      </FormGroup>
      <CloudinitNetworkForm cloudInitVolume={cloudInitVolume} updateVM={updateVM} />
      <FormGroup
        label={t('Authorized SSH Key')}
        fieldId={cloudinitIDGenerator(CloudInitDataFormKeys.SSH_AUTHORIZED_KEYS)}
        className="kv-cloudint-advanced-tab--validation-text"
      >
        <CloudinitSSHKeyForm
          id={cloudinitIDGenerator(CloudInitDataFormKeys.SSH_AUTHORIZED_KEYS)}
          value={tabsData?.scripts?.cloudInit?.sshKey || ''}
          onChange={onSSHKeyChange}
        />
      </FormGroup>
    </Form>
  );
};

export default CloudinitForm;
