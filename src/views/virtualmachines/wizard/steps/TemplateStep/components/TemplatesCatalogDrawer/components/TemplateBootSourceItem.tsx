import React, { type FC, memo, useEffect, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceKey } from '@kubevirt-utils/resources/shared';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { Button, ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { useDrawerContext } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/hooks/useDrawerContext';
import { getTemplateBootSourceLabel } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';

import ChangeBootSourceModal from './ChangeBootSourceModal/ChangeBootSourceModal';

const TemplateBootSourceItem: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const { control, setValue } = useVMWizard();
  const selectedTemplate = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_VM_DATA.SELECTED_TEMPLATE,
  });
  const bootSourceOverride = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_VM_DATA.BOOT_SOURCE_OVERRIDE,
  });
  const { template, vm } = useDrawerContext();
  const [isChangeBootSourceModalOpen, setIsChangeBootSourceModalOpen] = useState(false);

  const selectedTemplateKey = getResourceKey(selectedTemplate);
  const previousTemplateKeyRef = useRef(selectedTemplateKey);

  useEffect(() => {
    if (previousTemplateKeyRef.current !== selectedTemplateKey) {
      previousTemplateKeyRef.current = selectedTemplateKey;
      setValue(CREATE_VM_FORM_FIELDS_VM_DATA.BOOT_SOURCE_OVERRIDE, null);
    }
  }, [selectedTemplateKey, setValue]);

  const notAvailable = t('N/A');
  const bootSource = getTemplateBootSourceType(template);
  // Overriding requires a sourceRef-backed boot source (i.e. a DataSource reference),
  // not containerDisk, registry, http, or no-source templates — those don't use sourceRef
  // and CDI would reject a spec with conflicting source + sourceRef fields.
  const hasOverridableBootSource = Boolean(bootSource?.source?.sourceRef);
  const sourceRef = bootSourceOverride ?? bootSource?.source?.sourceRef;
  const bootSourceLabel = getTemplateBootSourceLabel(bootSource?.type, sourceRef, t);

  return (
    <>
      <DescriptionItem
        bodyContent={t('The boot source that provides the root disk image for this template.')}
        descriptionData={
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem data-test="template-boot-source">{bootSourceLabel || notAvailable}</FlexItem>
            {hasOverridableBootSource && (
              <FlexItem>
                <Button
                  aria-label={t('Change boot source')}
                  data-test="template-boot-source-edit"
                  icon={<PencilAltIcon />}
                  onClick={() => setIsChangeBootSourceModalOpen(true)}
                  variant={ButtonVariant.plain}
                />
              </FlexItem>
            )}
          </Flex>
        }
        descriptionHeader={t('Boot source')}
        isPopover
      />
      {hasOverridableBootSource && isChangeBootSourceModalOpen && (
        <ChangeBootSourceModal
          isOpen={isChangeBootSourceModalOpen}
          onClose={() => setIsChangeBootSourceModalOpen(false)}
          vm={vm}
        />
      )}
    </>
  );
});

export default TemplateBootSourceItem;
