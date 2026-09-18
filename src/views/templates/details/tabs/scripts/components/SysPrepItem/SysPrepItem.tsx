import { type FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import WindowsLabel from '@kubevirt-utils/components/Labels/WindowsLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { SysprepDescription } from '@kubevirt-utils/components/SysprepModal/SysprepDescription';
import { SysprepModal } from '@kubevirt-utils/components/SysprepModal/SysprepModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { Button, ButtonVariant, Flex, FlexItem, Title } from '@patternfly/react-core';
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
  template: Template;
};

const SysPrepItem: FC<SysPrepItemProps> = ({ template }) => {
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const vm = getTemplateVirtualMachineObject(template);
  const currentVMSysprepName = getVolumes(vm)?.find((volume) => volume?.sysprep?.configMap?.name)
    ?.sysprep?.configMap?.name;

  const sysPrepObject = getTemplateSysprepObject(template, currentVMSysprepName);

  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const onSysprepSelected = async (newSysprepName: string): Promise<void> => {
    const templateNoSysprepObj = deleteTemplateSysprepObject(template, currentVMSysprepName);
    return updateTemplateWithSysprep(templateNoSysprepObj, newSysprepName, currentVMSysprepName);
  };

  const onSysprepCreation = async (
    newUnattended: string,
    newAutoUnattend: string,
  ): Promise<void> => {
    const newSysPrepObject = updateSysprepObject(sysPrepObject, newUnattended, newAutoUnattend);
    const templateWithSysPrep = newSysPrepObject
      ? replaceTemplateSysprepObject(template, newSysPrepObject, currentVMSysprepName)
      : deleteTemplateSysprepObject(template, currentVMSysprepName);

    await updateTemplateWithSysprep(
      templateWithSysPrep,
      newSysPrepObject?.metadata?.name,
      currentVMSysprepName,
    );
  };

  return (
    <DescriptionItem
      descriptionData={
        <SysprepDescription
          cluster={getCluster(template)}
          namespace={getNamespace(template)}
          selectedSysprepName={currentVMSysprepName}
        />
      }
      descriptionHeader={
        <Flex className="vm-description-item__title">
          <FlexItem>
            <Title headingLevel="h2">
              {t('Sysprep')} {<WindowsLabel />}
            </Title>
          </FlexItem>
          <FlexItem>
            <Button
              icon={<PencilAltIcon />}
              iconPosition="end"
              isDisabled={!isTemplateEditable}
              isInline
              onClick={() =>
                createModal((modalProps) => (
                  <SysprepModal
                    {...modalProps}
                    cluster={getCluster(template)}
                    namespace={getNamespace(template)}
                    onSysprepCreation={onSysprepCreation}
                    onSysprepSelected={onSysprepSelected}
                    sysprepSelected={currentVMSysprepName}
                  />
                ))
              }
              type="button"
              variant={ButtonVariant.link}
            >
              {t('Edit')}
            </Button>
          </FlexItem>
        </Flex>
      }
    />
  );
};

export default SysPrepItem;
