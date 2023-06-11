import * as React from 'react';
import { Trans } from 'react-i18next';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
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
  Popover,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type AnnotationsProps = {
  vmi: V1VirtualMachineInstance;
};

const Annotations: React.FC<AnnotationsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  return (
    <>
      <DescriptionListTermHelpText>
        <Popover
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              Annotations is an unstructured key value map stored with a resource that may be set by
              external tools to store and retrieve arbitrary metadata. They are not queryable and
              should be preserved when modifying objects.
              <div>
                {`\nMore info:`}
                <a href="http://kubernetes.io/docs/user-guide/annotations">
                  {` http://kubernetes.io/docs/user-guide/annotations`}
                </a>
              </div>
              <Breadcrumb>
                <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
                <BreadcrumbItem>metadata</BreadcrumbItem>
                <BreadcrumbItem>annotations</BreadcrumbItem>
              </Breadcrumb>
            </Trans>
          }
          hasAutoWidth
          headerContent={t('Annotations')}
          maxWidth="30rem"
        >
          <DescriptionListTermHelpTextButton>{t('Annotations')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
      <DescriptionListDescription>
        <Button
          icon={
            <PencilAltIcon className="co-icon-space-l co-icon-space-r pf-c-button-icon--plain" />
          }
          onClick={() =>
            createModal((props) => (
              <AnnotationsModal
                obj={vmi}
                {...props}
                onSubmit={(annotations) =>
                  k8sPatch({
                    data: [
                      {
                        op: 'replace',
                        path: '/metadata/annotaions',
                        value: annotations,
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
        >
          {t('{{count}} Annotations', {
            count: Object.keys(vmi?.metadata?.annotations || {}).length,
          })}
        </Button>
      </DescriptionListDescription>
    </>
  );
};

export default Annotations;
