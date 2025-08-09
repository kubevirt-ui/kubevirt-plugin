import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import usePasstFeatureFlag from '@overview/SettingsTab/PreviewFeaturesTab/hooks/usePasstFeatureFlag';
import { Checkbox, FormGroup, Popover, Split, SplitItem } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type NetworkInterfacePasstProps = {
  namespace: string;
  onChange: (enabled: boolean) => void;
  passtEnabled: boolean;
};

const NetworkInterfacePasst: FC<NetworkInterfacePasstProps> = ({
  namespace,
  onChange,
  passtEnabled,
}) => {
  const cluster = useClusterParam();
  const passtFeatureFlag = usePasstFeatureFlag();

  const [isNamespaceManagedByUDN] = useNamespaceUDN(namespace, cluster);
  const { t } = useKubevirtTranslation();

  if (!isNamespaceManagedByUDN) return null;

  return (
    <FormGroup className="form-group-margin" fieldId="passt-checkbox">
      <Split hasGutter>
        <Checkbox
          id="passt-checkbox"
          isChecked={passtEnabled}
          isDisabled={!passtFeatureFlag.featureEnabled}
          label={t('Enable Passt network binding')}
          onChange={(_, checked) => onChange(checked)}
        />
        <SplitItem>
          {!passtFeatureFlag.featureEnabled && (
            <Popover
              bodyContent={() => (
                <div>
                  {t(
                    'To enable this feature, you need to enable the Passt feature flag in the cluster settings.',
                  )}

                  <Link to={`/k8s/ns/${namespace}/virtualization-overview/settings`}>
                    {t('Go to cluster settings')}
                  </Link>
                </div>
              )}
              aria-label={'Help'}
            >
              <HelpIcon />
            </Popover>
          )}
        </SplitItem>
      </Split>
    </FormGroup>
  );
};

export default NetworkInterfacePasst;
