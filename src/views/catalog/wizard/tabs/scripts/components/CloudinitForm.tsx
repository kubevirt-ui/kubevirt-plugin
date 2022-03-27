import * as React from 'react';
import { dump, load } from 'js-yaml';

import { produceVMDisks, UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import { CloudInitDataFormKeys, CloudInitDataHelper } from '../utils/cloud-init-data-helper';
import { cloudinitIDGenerator } from '../utils/cloudint-utils';
import useCloudinitValidations from '../utils/use-cloudinit-validations';

import CloutinitSSHKeyForm from './CloudinitSSHKeyForm/CloudInitSSHKeyForm';

type CloudinitFormProps = {
  cloudInitVolume: V1Volume;
  updateVM: UpdateValidatedVM;
};
const CloudinitForm: React.FC<CloudinitFormProps> = ({ cloudInitVolume, updateVM }) => {
  const { t } = useKubevirtTranslation();

  const [cloudinitConfigUserData, isBase64] = React.useMemo(
    () => CloudInitDataHelper.getUserData(cloudInitVolume?.cloudInitNoCloud || {}),
    [cloudInitVolume],
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

  const onUpdateVM = React.useCallback(
    () =>
      updateVM((vmToUpdate) =>
        produceVMDisks(vmToUpdate, (vmDraft) => {
          const updatedCloudinitVolume = {
            ...(cloudInitVolume || { name: 'cloudinitdisk' }),
            cloudInitNoCloud: CloudInitDataHelper.toCloudInitNoCloudSource(yaml, isBase64),
          };

          const otherVolumes = getVolumes(vmDraft).filter((vol) => !vol.cloudInitNoCloud);
          vmDraft.spec.template.spec.volumes = [...otherVolumes, updatedCloudinitVolume];
        }),
      ),
    [cloudInitVolume, isBase64, updateVM, yaml],
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
    if (yaml && isValid) {
      const timerId = setTimeout(() => onUpdateVM(), 100);

      return () => clearTimeout(timerId);
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
      <FormGroup
        label={t('Authorized SSH Key')}
        fieldId={cloudinitIDGenerator(CloudInitDataFormKeys.SSH_AUTHORIZED_KEYS)}
        className="kv-cloudint-advanced-tab--validation-text"
      >
        <CloutinitSSHKeyForm
          id={cloudinitIDGenerator(CloudInitDataFormKeys.SSH_AUTHORIZED_KEYS)}
          value={
            Array.isArray(yamlAsJS?.ssh_authorized_keys)
              ? yamlAsJS?.ssh_authorized_keys?.[0]
              : yamlAsJS?.ssh_authorized_keys || ''
          }
          onChange={(updatedKey) => {
            const otherKeys = Array.isArray(yamlAsJS?.ssh_authorized_keys)
              ? yamlAsJS?.ssh_authorized_keys?.slice(1)
              : [];
            onFieldChange(CloudInitDataFormKeys.SSH_AUTHORIZED_KEYS, [updatedKey, ...otherKeys]);
          }}
        />
      </FormGroup>
    </Form>
  );
};

export default CloudinitForm;
