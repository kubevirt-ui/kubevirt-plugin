import * as React from 'react';
import { useParams } from 'react-router-dom';
import { isCommonVMTemplate } from 'src/views/templates/utils/utils';

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

import { updateTemplateSysprep } from './sysprep-utils';
import { SysprepDescription } from './SysPrepDescription';

type SysPrepItemProps = {
  template: V1Template;
};

const SysPrepItem: React.FC<SysPrepItemProps> = ({ template }) => {
  const { ns: namespace } = useParams<{ ns: string }>();
  const isEditDisabled = isCommonVMTemplate(template);
  const vm = getTemplateVirtualMachineObject(template);

  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const vmSysPrepName = getVolumes(vm)?.find((volume) => volume?.sysprep?.configMap?.name)?.sysprep
    ?.configMap?.name;

  const [sysPrepConfig, loaded, sysprepLoadError] = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
    vmSysPrepName
      ? {
          groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
          namespace,
          name: vmSysPrepName,
        }
      : null,
  );

  const autoUnattend = sysPrepConfig?.data?.[AUTOUNATTEND];
  const unattend = sysPrepConfig?.data?.[UNATTEND];

  const onSysprepSelected = async (newSysprepName: string) => {
    return updateTemplateSysprep(template, newSysprepName, vmSysPrepName);
  };

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        <DescriptionListTermHelpText>
          <Flex className="vm-description-item__title">
            <FlexItem>{t('Sysprep')}</FlexItem>
            {!isEditDisabled && (
              <FlexItem>
                <Button
                  type="button"
                  isInline
                  onClick={() =>
                    createModal((modalProps) => (
                      <SysprepModal
                        {...modalProps}
                        unattend={unattend}
                        autoUnattend={autoUnattend}
                        onSysprepSelected={onSysprepSelected}
                        sysprepSelected={vmSysPrepName}
                        enableCreation={false}
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
        <SysprepDescription
          hasAutoUnattend={!!autoUnattend}
          hasUnattend={!!unattend}
          loaded={loaded}
          error={sysprepLoadError}
        />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default SysPrepItem;
