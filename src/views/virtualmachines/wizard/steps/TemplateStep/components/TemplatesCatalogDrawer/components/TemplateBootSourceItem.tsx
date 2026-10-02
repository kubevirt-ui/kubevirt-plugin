import { type FC, memo, useEffect, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceKey } from '@kubevirt-utils/resources/shared';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useDrawerContext } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/hooks/useDrawerContext';
import { getTemplateBootSourceLabel } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';

import ChangeBootSourceModal from './ChangeBootSourceModal/ChangeBootSourceModal';

const TemplateBootSourceItem: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const { control, setValue } = useVMWizardForm();
  const [selectedTemplate, bootSourceOverride] = useWatch({
    control,
    name: ['template.selectedTemplate', 'template.bootSourceOverride'],
  });
  const { template, vm } = useDrawerContext();
  const [isChangeBootSourceModalOpen, setIsChangeBootSourceModalOpen] = useState(false);

  const selectedTemplateKey = getResourceKey(selectedTemplate);
  const previousTemplateKeyRef = useRef(selectedTemplateKey);

  useEffect(() => {
    if (previousTemplateKeyRef.current !== selectedTemplateKey) {
      previousTemplateKeyRef.current = selectedTemplateKey;
      setValue('template.bootSourceOverride', null);
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
        data-test="template-boot-source"
        descriptionData={bootSourceLabel || notAvailable}
        descriptionHeader={t('Boot source')}
        isEdit={hasOverridableBootSource}
        isPopover
        onEditClick={() => setIsChangeBootSourceModalOpen(true)}
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
