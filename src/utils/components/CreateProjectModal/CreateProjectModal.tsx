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
  isOpen: boolean;
  onClose: () => void;
  createdProject?: (value: K8sResourceCommon) => void;
};

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  createdProject,
}) => {
  const { t } = useKubevirtTranslation();
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [displayName, setDisplayName] = useState<string>();

  return (
    <TabModal<K8sResourceCommon & { displayName: string; description: string }>
      obj={{ displayName, description, metadata: { name } }}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={(data) =>
        k8sCreate({
          model: ProjectRequestModel,
          data,
        }).then((value) => createdProject(value))
      }
      headerText={t('Create project')}
      submitBtnText={t('Create')}
      isDisabled={isEmpty(name)}
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
          label={t('Name')}
          labelIcon={
            <Popover
              bodyContent={
                <Trans t={t} ns="plugin__kubevirt-plugin">
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
          isRequired
          fieldId="project-name"
        >
          <TextInput
            isRequired
            type="text"
            id="project-name"
            name="project-name"
            value={name}
            onChange={(value) => setName(value)}
          />
        </FormGroup>
        <FormGroup label="Display name" fieldId="display-name">
          <TextInput
            type="text"
            id="display-name"
            name="display-name"
            value={displayName}
            onChange={(value) => setDisplayName(value)}
          />
        </FormGroup>
        <FormGroup label="Description" fieldId="description">
          <TextInput
            type="text"
            id="description"
            name="description"
            value={description}
            onChange={(value) => setDescription(value)}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default CreateProjectModal;
