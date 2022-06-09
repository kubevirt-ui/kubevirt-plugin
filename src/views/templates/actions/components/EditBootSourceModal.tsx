import * as React from 'react';
import { Trans } from 'react-i18next';

import { getTemplateStorageQuantity } from '@catalog/customize/components/CustomizeSource/utils';
import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Button, Form, FormGroup, Popover, TextInput } from '@patternfly/react-core';

import { SOURCE_TYPES } from '../../utils/constants';
import { editBootSource } from '../editBootSource';

import useBootSourceEditAffectedTemplates from './hooks/useBootSourceEditAffectedTemplates';
import { SelectSource } from './SelectSource';

import './EditBootSourceModal.scss';

type EditBootSourceModalProps = {
  isOpen: boolean;
  obj: V1Template;
  dataSource: V1beta1DataSource;
  onClose: () => void;
};

const EditBootSourceModal: React.FC<EditBootSourceModalProps> = ({
  isOpen,
  obj,
  dataSource,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const [bootSource, setBootSource] = React.useState<V1beta1DataVolumeSpec>();
  const [sourceProvider, setSourceProvider] = React.useState('');

  const affectedTemplates = useBootSourceEditAffectedTemplates(obj);

  const onSubmit = async () => {
    await editBootSource(dataSource, bootSource);
  };

  return (
    <>
      <TabModal<K8sResourceCommon>
        obj={obj}
        headerText={t('Edit Boot source to template')}
        onSubmit={onSubmit}
        isOpen={isOpen}
        onClose={onClose}
      >
        <Alert isInline className="margin-bottom-md" variant="warning" title={t('Warning')}>
          <Trans ns="plugin__kubevirt-plugin">
            Editing the DataSource will affect{' '}
            <Popover
              headerContent={t('Affected Templates')}
              bodyContent={(affectedTemplates || []).map((template) => (
                <ResourceLink
                  key={template.metadata.uid}
                  groupVersionKind={modelToGroupVersionKind(TemplateModel)}
                  name={template.metadata.name}
                  namespace={template.metadata.namespace}
                  linkTo={false}
                />
              ))}
            >
              <Button variant="link" isInline>
                {' '}
                all templates
              </Button>
            </Popover>{' '}
            that are currently using this DataSource.
          </Trans>
        </Alert>

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
              withSize
              initialVolumeQuantity={getTemplateStorageQuantity(obj)}
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
