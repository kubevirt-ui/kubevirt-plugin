import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import {
  ConfigMapModel,
  modelToGroupVersionKind,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import WindowsLabel from '@kubevirt-utils/components/Labels/WindowsLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { AUTOUNATTEND, UNATTEND } from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { SysprepDescription } from '@kubevirt-utils/components/SysprepModal/SysprepDescription';
import { SysprepModal } from '@kubevirt-utils/components/SysprepModal/SysprepModal';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import useEditTemplateAccessReview from '../../../../hooks/useIsTemplateEditable';

import {
  deleteTemplateSysprepObject,
  getTemplateSysprepObject,
  replaceTemplateSysprepObject,
  updateSysprepObject,
  updateTemplateWithSysprep,
} from './sysprep-utils';

type SysPrepItemProps = {
  template: V1Template;
};

const SysPrepItem: FC<SysPrepItemProps> = ({ template }) => {
  const { ns: namespace } = useParams<{ ns: string }>();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const vm = getTemplateVirtualMachineObject(template);
  const currentVMSysprepName = getVolumes(vm)?.find((volume) => volume?.sysprep?.configMap?.name)
    ?.sysprep?.configMap?.name;

  const sysPrepObject = getTemplateSysprepObject(template, currentVMSysprepName);

  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const externalSysprepSelected = isEmpty(sysPrepObject) && currentVMSysprepName;

  const [externalSysprepConfig, sysprepLoaded, sysprepLoadError] =
    useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
      externalSysprepSelected
        ? {
            groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
            name: externalSysprepSelected,
            namespace,
          }
        : null,
    );

  const { [AUTOUNATTEND]: autoUnattend, [UNATTEND]: unattend } =
    externalSysprepConfig?.data || sysPrepObject?.data || {};

  const onSysprepSelected = async (newSysprepName: string) => {
    const templateNoSysprepObj = deleteTemplateSysprepObject(template, currentVMSysprepName);
    return updateTemplateWithSysprep(templateNoSysprepObj, newSysprepName, currentVMSysprepName);
  };

  const onSysprepCreation = (newUnattended: string, newAutoUnattend: string) => {
    const newSysPrepObject = updateSysprepObject(sysPrepObject, newUnattended, newAutoUnattend, vm);
    const templateWithSysPrep = newSysPrepObject
      ? replaceTemplateSysprepObject(template, newSysPrepObject, currentVMSysprepName)
      : deleteTemplateSysprepObject(template, currentVMSysprepName);

    return updateTemplateWithSysprep(
      templateWithSysPrep,
      newSysPrepObject?.metadata?.name,
      externalSysprepSelected,
    );
  };

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        <DescriptionListTermHelpText>
          <Flex className="vm-description-item__title">
            <FlexItem>
              <Title headingLevel="h2">
                {t('Sysprep')} {<WindowsLabel />}
              </Title>
            </FlexItem>
            <FlexItem>
              <Button
                onClick={() =>
                  createModal((modalProps) => (
                    <SysprepModal
                      {...modalProps}
                      autoUnattend={autoUnattend}
                      namespace={vm?.metadata?.namespace || DEFAULT_NAMESPACE}
                      onSysprepCreation={onSysprepCreation}
                      onSysprepSelected={onSysprepSelected}
                      sysprepSelected={externalSysprepSelected}
                      unattend={unattend}
                    />
                  ))
                }
                isDisabled={!isTemplateEditable}
                isInline
                type="button"
                variant="link"
              >
                {t('Edit')}
                <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
              </Button>
            </FlexItem>
          </Flex>
        </DescriptionListTermHelpText>
      </DescriptionListTerm>
      <DescriptionListDescription>
        <SysprepDescription
          error={sysprepLoadError}
          hasAutoUnattend={!!autoUnattend}
          hasUnattend={!!unattend}
          loaded={sysprepLoaded}
        />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default SysPrepItem;
