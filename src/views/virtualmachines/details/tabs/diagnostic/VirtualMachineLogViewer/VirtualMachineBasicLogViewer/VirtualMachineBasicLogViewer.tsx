import React, { FC, useState } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { KUBEVIRT_V1_VIRTUALMACHINE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye, Checkbox, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';

type VirtualMachineBasicLogViewerProps = {
  data: string[];
  isExternal?: boolean;
  vmi: V1VirtualMachineInstance;
};
const VirtualMachineBasicLogViewer: FC<VirtualMachineBasicLogViewerProps> = ({
  data,
  isExternal = false,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [isTextWrapped, setIsTextWrapped] = useState<boolean>(false);

  if (!vmi) {
    return <Bullseye>{t('VirtualMachine is not running.')}</Bullseye>;
  }

  if (isEmpty(data)) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  return (
    <LogViewer
      toolbar={
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <LogViewerSearch minSearchChars={3} placeholder="Search..." />
            </ToolbarItem>
            <ToolbarItem alignment={{ default: 'alignRight' }}>
              <Checkbox
                id="wrap-text-checkbox"
                isChecked={isTextWrapped}
                label={t('Wrap text')}
                onChange={setIsTextWrapped}
              />
            </ToolbarItem>
            {!isExternal && (
              <>
                <ToolbarItem variant="separator" />
                <ToolbarItem>
                  <ExternalLink
                    href={`/k8s/ns/${vmi?.metadata?.namespace}/${KUBEVIRT_V1_VIRTUALMACHINE}/${vmi?.metadata?.name}/diagnostics/logs/standalone`}
                  >
                    {t('Open logs in a new window')}
                  </ExternalLink>
                </ToolbarItem>
              </>
            )}
          </ToolbarContent>
        </Toolbar>
      }
      data={data}
      isTextWrapped={isTextWrapped}
      scrollToRow={data.length}
      theme="dark"
    />
  );
};

export default VirtualMachineBasicLogViewer;
