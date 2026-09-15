import type { FC } from 'react';

import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import useIsVMEditable from '@kubevirt-utils/components/VMEditPermissionContext/useIsVMEditable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { DescriptionList, Divider, PageSection, Title } from '@patternfly/react-core';

import { onSubmitYAML } from '../details/utils/utils';
import type { ConfigurationInnerTabProps } from '../utils/types';
import InitialRunTabCloudinit from './components/InitialRunTabCloudinit';
import InitialRunTabSysprep from './components/InitialRunTabSysprep';

const InitialRunTab: FC<ConfigurationInnerTabProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const isEditable = useIsVMEditable();

  return (
    <SidebarEditor
      onResourceUpdate={onSubmitYAML}
      pathsToHighlight={PATHS_TO_HIGHLIGHT.SCRIPTS_TAB}
      resource={vm}
    >
      {(resource) => (
        <PageSection>
          <Title headingLevel="h2">
            <SearchItem id="initial-run">{t('Initial run')}</SearchItem>
          </Title>
          <DescriptionList>
            <InitialRunTabCloudinit
              canUpdateVM={isEditable}
              onSubmit={onSubmitYAML}
              vm={resource}
              vmi={vmi}
            />
            <Divider />
            <InitialRunTabSysprep canUpdateVM={isEditable} vm={resource} />
          </DescriptionList>
        </PageSection>
      )}
    </SidebarEditor>
  );
};

export default InitialRunTab;
