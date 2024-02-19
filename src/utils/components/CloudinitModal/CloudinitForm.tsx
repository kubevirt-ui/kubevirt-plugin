import React, { FC, Fragment, Suspense, useState } from 'react';
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
  InputGroupItem,
  TextInput,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';

import { CloudInitNetworkData, CloudInitUserData } from './utils/cloudinit-utils';
import CloudInitEditor from './CloudInitEditor';
import { CloudinitNetworkForm } from './CloudInitNetworkForm';

type CloudinitFormProps = {
  cloudInitVolume: V1Volume;
  enableNetworkData: boolean;
  networkData: CloudInitNetworkData;
  onEditorSave: (yaml: string) => void;
  setEnableNetworkData: (value: boolean) => void;
  setSubmitDisabled: (value: boolean) => void;
  showEditor: boolean;
  updateNetworkField: (key: keyof CloudInitNetworkData, value: string) => void;
  updateUserField: (key: keyof CloudInitUserData, value: string) => void;
  userData: CloudInitUserData;
};
const CloudinitForm: FC<CloudinitFormProps> = ({
  cloudInitVolume,
  enableNetworkData,
  networkData,
  onEditorSave,
  setEnableNetworkData,
  setSubmitDisabled,
  showEditor,
  updateNetworkField,
  updateUserField,
  userData,
}) => {
  const { t } = useKubevirtTranslation();
  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);

  return (
    <Fragment key="cloudinit-editor">
      {showEditor ? (
        <Suspense
          fallback={
            <Bullseye>
              <Loading />
            </Bullseye>
          }
        >
          <CloudInitEditor cloudInitVolume={cloudInitVolume} onSave={onEditorSave} />
        </Suspense>
      ) : (
        <Form>
          <FormGroup
            className="kv-cloudint-advanced-tab--validation-text"
            fieldId={'cloudinit-user'}
            isRequired
            label={t('User')}
            required
          >
            <TextInput
              onChange={(_event, v) => {
                setSubmitDisabled(isEmpty(v));
                updateUserField('user', v);
              }}
              id={'cloudinit-user'}
              type="text"
              value={userData?.user || ''}
            />
          </FormGroup>
          <FormGroup
            className="kv-cloudint-advanced-tab--validation-text"
            fieldId={'cloudinit-password'}
            label={t('Password')}
          >
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  id="cloudinit-password"
                  onChange={(_event, v) => updateUserField('password', v)}
                  type={passwordHidden ? 'password' : 'text'}
                  value={userData?.password || ''}
                />
              </InputGroupItem>
              <InputGroupItem>
                <Button
                  onClick={() => setPasswordHidden(!passwordHidden)}
                  variant={ButtonVariant.link}
                >
                  {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
                </Button>
              </InputGroupItem>
            </InputGroup>
            <FormGroupHelperText>
              <Trans ns="plugin__kubevirt-plugin" t={t}>
                Password for this username -{' '}
                <Button
                  onClick={() =>
                    updateUserField(
                      'password',
                      new RandExp(/[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}/).gen(),
                    )
                  }
                  isInline
                  variant={ButtonVariant.link}
                >
                  generate password
                </Button>
              </Trans>
            </FormGroupHelperText>
          </FormGroup>
          <CloudinitNetworkForm
            enableNetworkData={enableNetworkData}
            networkData={networkData}
            setEnableNetworkData={setEnableNetworkData}
            updateNetworkField={updateNetworkField}
          />
        </Form>
      )}
    </Fragment>
  );
};

export default CloudinitForm;
