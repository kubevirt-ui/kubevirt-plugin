import React, { useState } from 'react';
import { Trans } from 'react-i18next';

import { ProjectRequestModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Popover,
  Text,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import ExternalLink from '../ExternalLink/ExternalLink';
import TabModal from '../TabModal/TabModal';

type CreateProjectModalProps = {
  createdProject?: (value: K8sResourceCommon) => void;
  isOpen: boolean;
  onClose: () => void;
};

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  createdProject,
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [displayName, setDisplayName] = useState<string>();

  return (
    <TabModal<K8sResourceCommon & { description: string; displayName: string }>
      onSubmit={(data) =>
        k8sCreate({
          data,
          model: ProjectRequestModel,
        }).then((value) => createdProject(value))
      }
      headerText={t('Create project')}
      isDisabled={isEmpty(name)}
      isOpen={isOpen}
      obj={{ description, displayName, metadata: { name } }}
      onClose={onClose}
      submitBtnText={t('Create')}
    >
      <Text>
        {t('An OpenShift project is an alternative representation of a Kubernetes namespace.')}
      </Text>
      <br />
      <ExternalLink href="https://docs.okd.io/latest/applications/projects/working-with-projects.html">
        {t('Learn more about working with projects')}
      </ExternalLink>
      <br />
      <br />
      <Form>
        <FormGroup
          labelIcon={
            <Popover
              bodyContent={
                <Trans ns="plugin__kubevirt-plugin" t={t}>
                  A Project name must consist of lower case alphanumeric characters or &apos;, and
                  must start and end with an alphanumeric character (e.g. &apos;my-name&apos; or
                  &apos;123-abc&apos;). You must create a Namespace to be able to create projects
                  that begin with &apos;openshift-&apos;, &apos;kubernetes-&apos;, or
                  &apos;kube-&apos;.
                </Trans>
              }
            >
              <Button variant={ButtonVariant.plain}>
                <HelpIcon />
              </Button>
            </Popover>
          }
          fieldId="project-name"
          isRequired
          label={t('Name')}
        >
          <TextInput
            id="project-name"
            isRequired
            name="project-name"
            onChange={(_event, value) => setName(value)}
            type="text"
            value={name}
          />
        </FormGroup>
        <FormGroup fieldId="display-name" label="Display name">
          <TextInput
            id="display-name"
            name="display-name"
            onChange={(_event, value) => setDisplayName(value)}
            type="text"
            value={displayName}
          />
        </FormGroup>
        <FormGroup fieldId="description" label="Description">
          <TextInput
            id="description"
            name="description"
            onChange={(_event, value) => setDescription(value)}
            type="text"
            value={description}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default CreateProjectModal;
