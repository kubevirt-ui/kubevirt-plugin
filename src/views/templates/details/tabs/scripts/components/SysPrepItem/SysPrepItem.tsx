import * as React from 'react';
import { useParams } from 'react-router-dom';
import TooltipNoEditPermissions from 'src/views/templates/details/TooltipNoEditPermissions';

import {
  ConfigMapModel,
  modelToGroupVersionKind,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { AUTOUNATTEND, UNATTEND } from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { SysprepModal } from '@kubevirt-utils/components/SysprepModal/SysprepModal';
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
import { SysprepDescription } from './SysPrepDescription';

type SysPrepItemProps = {
  template: V1Template;
};

const SysPrepItem: React.FC<SysPrepItemProps> = ({ template }) => {
  const { ns: namespace } = useParams<{ ns: string }>();
  const { isTemplateEditable, hasEditPermission } = useEditTemplateAccessReview(template);
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
            namespace,
            name: externalSysprepSelected,
          }
        : null,
    );

  const { [UNATTEND]: unattend, [AUTOUNATTEND]: autoUnattend } =
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
            <FlexItem>{t('Sysprep')}</FlexItem>
            <FlexItem>
              <TooltipNoEditPermissions hasEditPermission={hasEditPermission}>
                <Button
                  type="button"
                  isDisabled={!isTemplateEditable}
                  isInline
                  onClick={() =>
                    createModal((modalProps) => (
                      <SysprepModal
                        {...modalProps}
                        unattend={unattend}
                        autoUnattend={autoUnattend}
                        onSysprepSelected={onSysprepSelected}
                        sysprepSelected={externalSysprepSelected}
                        onSysprepCreation={onSysprepCreation}
                      />
                    ))
                  }
                  variant="link"
                >
                  {t('Edit')}
                  <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
                </Button>
              </TooltipNoEditPermissions>
            </FlexItem>
          </Flex>
        </DescriptionListTermHelpText>
      </DescriptionListTerm>
      <DescriptionListDescription>
        <SysprepDescription
          hasAutoUnattend={!!autoUnattend}
          hasUnattend={!!unattend}
          loaded={sysprepLoaded}
          error={sysprepLoadError}
        />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default SysPrepItem;
