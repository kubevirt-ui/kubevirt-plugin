import * as React from 'react';
import { Trans } from 'react-i18next';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DescriptionListDescription,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Label,
  LabelGroup,
  Popover,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import './labels.scss';

type LabelsProps = {
  vmi: V1VirtualMachineInstance;
};

const Labels: React.FC<LabelsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <>
      <DescriptionListTermHelpText>
        <Popover
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              Map of string keys and values that can be used to organize and categorize (scope and
              select) objects. May match selectors of replication controllers and services.
              <div>
                {`\nMore info:`}
                <a href="http://kubernetes.io/docs/user-guide/labels">
                  {` http://kubernetes.io/docs/user-guide/labels`}
                </a>
              </div>
              <Breadcrumb>
                <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
                <BreadcrumbItem>metadata</BreadcrumbItem>
                <BreadcrumbItem>labels</BreadcrumbItem>
              </Breadcrumb>
            </Trans>
          }
          hasAutoWidth
          headerContent={t('Labels')}
          maxWidth="30rem"
        >
          <DescriptionListTermHelpTextButton>{t('Labels')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
      <DescriptionListDescription className="Labels--container">
        <LabelGroup>
          {Object.entries(vmi?.metadata?.labels || {})?.map(([key, value]) => (
            <Label color="blue" key={key} variant="outline">{`${key}=${value}`}</Label>
          ))}
        </LabelGroup>
        <Button
          icon={
            <PencilAltIcon className="co-icon-space-l co-icon-space-r pf-c-button-icon--plain" />
          }
          onClick={() =>
            createModal((props) => (
              <LabelsModal
                obj={vmi}
                {...props}
                onLabelsSubmit={(labels) =>
                  k8sPatch({
                    data: [
                      {
                        op: 'replace',
                        path: '/metadata/labels',
                        value: labels,
                      },
                    ],
                    model: VirtualMachineInstanceModel,
                    resource: vmi,
                  })
                }
              />
            ))
          }
          iconPosition={'right'}
          isInline
          variant="link"
        ></Button>
      </DescriptionListDescription>
    </>
  );
};

export default Labels;
