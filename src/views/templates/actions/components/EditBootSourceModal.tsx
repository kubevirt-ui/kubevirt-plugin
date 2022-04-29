import * as React from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sCreate, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Form, FormGroup, TextInput } from '@patternfly/react-core';

import { SOURCE_TYPES } from '../../utils/constants';

import { SelectSource } from './SelectSource';

import './EditBootSourceModal.scss';

type EditBootSourceModalProps = {
  isOpen: boolean;
  obj: V1Template;
  onClose: () => void;
};

const EditBootSourceModal: React.FC<EditBootSourceModalProps> = ({ isOpen, obj, onClose }) => {
  const { t } = useKubevirtTranslation();
  const [bootSource, setBootSource] = React.useState<V1beta1DataVolumeSpec>();
  const [sourceProvider, setSourceProvider] = React.useState('');

  const onSubmit = async () => {
    await k8sCreate({
      model: TemplateModel,
      data: { bootSource, ...obj }, // TODO
    });
  };

  return (
    <>
      <TabModal<K8sResourceCommon>
        obj={obj}
        headerText={t('Edit Boot source to template')}
        onSubmit={onSubmit}
        isOpen={isOpen}
        onClose={onClose}
        submitBtnText={t('Save')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <p className="margin-bottom-md">
          This data can be found in{' '}
          <b>
            Storage {'>'} Persistent volume claims {'>'} ...
          </b>{' '}
          under the <b>kubevirt-os-images</b> project
        </p>
        <Form>
          <FormGroup fieldId="boot-source-type" isRequired>
            <SelectSource
              onSourceChange={setBootSource}
              sourceLabel={t('Boot source type')}
              sourceOptions={[
                SOURCE_TYPES.pvcSource,
                SOURCE_TYPES.registrySource,
                SOURCE_TYPES.httpSource,
                SOURCE_TYPES.uploadSource,
              ]}
            />
          </FormGroup>
          <FormGroup
            label={t('Boot source provider')}
            fieldId="boot-source-provider"
            isRequired
            helperText={t('Example: your company name')}
          >
            <TextInput
              id="boot-source-provider"
              type="text"
              value={sourceProvider}
              onChange={setSourceProvider}
            />
          </FormGroup>
        </Form>
      </TabModal>
    </>
  );
};

export default EditBootSourceModal;
