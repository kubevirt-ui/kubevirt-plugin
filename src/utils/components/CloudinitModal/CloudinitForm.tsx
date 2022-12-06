import * as React from 'react';
import { Trans } from 'react-i18next';
import RandExp from 'randexp';

import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Loading } from '@patternfly/quickstarts';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  InputGroup,
  TextInput,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { CloudInitNetworkData, CloudInitUserData } from './utils/cloudinit-utils';
import CloudInitEditor from './CloudInitEditor';
import { CloudinitNetworkForm } from './CloudInitNetworkForm';

type CloudinitFormProps = {
  cloudInitVolume: V1Volume;
  showEditor: boolean;
  userData: CloudInitUserData;
  networkData: CloudInitNetworkData;
  enableNetworkData: boolean;
  updateUserField: (key: keyof CloudInitUserData, value: string) => void;
  updateNetworkField: (key: keyof CloudInitNetworkData, value: string) => void;
  onEditorSave: (yaml: string) => void;
  setEnableNetworkData: (value: boolean) => void;
  setSubmitDisabled: (value: boolean) => void;
};
const CloudinitForm: React.FC<CloudinitFormProps> = ({
  cloudInitVolume,
  userData,
  networkData,
  updateUserField,
  updateNetworkField,
  onEditorSave,
  showEditor,
  enableNetworkData,
  setEnableNetworkData,
  setSubmitDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const [passwordHidden, setPasswordHidden] = React.useState<boolean>(true);

  return (
    <React.Fragment key="cloudinit-editor">
      {showEditor ? (
        <React.Suspense
          fallback={
            <Bullseye>
              <Loading />
            </Bullseye>
          }
        >
          <CloudInitEditor cloudInitVolume={cloudInitVolume} onSave={onEditorSave} />
        </React.Suspense>
      ) : (
        <Form>
          <FormGroup
            label={t('User')}
            fieldId={'cloudinit-user'}
            className="kv-cloudint-advanced-tab--validation-text"
            isRequired
            required
          >
            <TextInput
              type="text"
              id={'cloudinit-user'}
              value={userData?.user || ''}
              onChange={(v) => {
                setSubmitDisabled(isEmpty(v));
                updateUserField('user', v);
              }}
            />
          </FormGroup>
          <FormGroup
            label={t('Password')}
            fieldId={'cloudinit-password'}
            className="kv-cloudint-advanced-tab--validation-text"
            helperText={
              <Trans t={t} ns="plugin__kubevirt-plugin">
                Password for this username -{' '}
                <Button
                  variant={ButtonVariant.link}
                  isInline
                  onClick={() =>
                    updateUserField(
                      'password',
                      new RandExp(/[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}/).gen(),
                    )
                  }
                >
                  generate password
                </Button>
              </Trans>
            }
          >
            <InputGroup>
              <TextInput
                type={passwordHidden ? 'password' : 'text'}
                id="cloudinit-password"
                value={userData?.password || ''}
                onChange={(v) => updateUserField('password', v)}
              />
              <Button
                variant={ButtonVariant.link}
                onClick={() => setPasswordHidden(!passwordHidden)}
              >
                {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
              </Button>
            </InputGroup>
          </FormGroup>
          <CloudinitNetworkForm
            networkData={networkData}
            updateNetworkField={updateNetworkField}
            enableNetworkData={enableNetworkData}
            setEnableNetworkData={setEnableNetworkData}
          />
        </Form>
      )}
    </React.Fragment>
  );
};

export default CloudinitForm;
