import { type FC } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, Divider, PageSection, Title } from '@patternfly/react-core';
import InitialRunTabCloudinit from '@virtualmachines/details/tabs/configuration/initialrun/components/InitialRunTabCloudinit';
import InitialRunTabSysprep from '@virtualmachines/details/tabs/configuration/initialrun/components/InitialRunTabSysprep';
import { type SubmitSysprepVM } from '@virtualmachines/details/tabs/configuration/initialrun/utils/utils';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

const CustomizeInstanceTypeInitialRunTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const { replaceDraft, vmDraft: vm } = useWizardVMDraft();

  if (!vm) return <Loading />;

  const onSysprepSubmit: SubmitSysprepVM = (updatedVM) => replaceDraft(updatedVM);

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="initial-run">{t('Initial run')}</SearchItem>
      </Title>
      <DescriptionList>
        <InitialRunTabCloudinit
          canUpdateVM
          onSubmit={async (updatedVM) => replaceDraft(updatedVM) ?? updatedVM}
          vm={vm}
        />
        <Divider />
        <InitialRunTabSysprep canUpdateVM onSubmit={onSysprepSubmit} vm={vm} />
      </DescriptionList>
    </PageSection>
  );
};

export default CustomizeInstanceTypeInitialRunTab;
