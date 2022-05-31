import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import produce from 'immer';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import { CloudinitModal } from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { isCommonVMTemplate } from '../../../utils';

type TemplateScriptsPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj: V1Template;
};

const TemplateScriptsPage: React.FC<TemplateScriptsPageProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const isEditDisabled = isCommonVMTemplate(template);
  const vm = getTemplateVirtualMachineObject(template);

  const { createModal } = useModal();

  const onSubmit = React.useCallback(
    async (updatedVM: V1VirtualMachine) => {
      const updatedTemplate = produce(template, (draftTemplate) => {
        draftTemplate.objects[0] = updatedVM;
      });
      await k8sUpdate({
        model: TemplateModel,
        data: updatedTemplate,
        ns: template?.metadata?.namespace,
        name: template?.metadata?.name,
      });
    },
    [template],
  );

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem span={5}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>
                <DescriptionListTermHelpText>
                  <Flex className="vm-description-item__title">
                    <FlexItem>{t('Cloud-init')}</FlexItem>
                    {!isEditDisabled && (
                      <FlexItem>
                        <Button
                          type="button"
                          isInline
                          onClick={() =>
                            createModal(({ isOpen, onClose }) => (
                              <CloudinitModal
                                vm={vm}
                                isOpen={isOpen}
                                onClose={onClose}
                                onSubmit={onSubmit}
                              />
                            ))
                          }
                          variant="link"
                        >
                          {t('Edit')}
                          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
                        </Button>
                      </FlexItem>
                    )}
                  </Flex>
                </DescriptionListTermHelpText>
              </DescriptionListTerm>
              <DescriptionListDescription>
                <CloudInitDescription vm={vm} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default TemplateScriptsPage;
