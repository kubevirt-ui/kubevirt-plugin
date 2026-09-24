import { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, Divider, PageSection, Title } from '@patternfly/react-core';
import InitialRunTabCloudinit from '@virtualmachines/details/tabs/configuration/initialrun/components/InitialRunTabCloudinit';
import InitialRunTabSysprep from '@virtualmachines/details/tabs/configuration/initialrun/components/InitialRunTabSysprep';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM } from '@virtualmachines/wizard/state/vm-wizard-form/consts';

import useUpdateCustomizeInstanceTypeTab from '../hooks/useUpdateCustomizeInstanceTypeTab';

const CustomizeInstanceTypeInitialRunTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizard();
  const vm = useWatch({ control, name: CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM });
  const { updateVMFromForm } = useUpdateCustomizeInstanceTypeTab();

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="initial-run">{t('Initial run')}</SearchItem>
      </Title>
      <DescriptionList>
        <InitialRunTabCloudinit canUpdateVM onSubmit={updateVMFromForm} vm={vm} />
        <Divider />
        <InitialRunTabSysprep canUpdateVM onSubmit={updateVMFromForm} vm={vm} />
      </DescriptionList>
    </PageSection>
  );
};

export default CustomizeInstanceTypeInitialRunTab;
