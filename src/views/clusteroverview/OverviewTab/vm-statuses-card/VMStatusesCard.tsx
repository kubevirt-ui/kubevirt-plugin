import * as React from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Card,
  CardHeader,
  CardTitle,
  Divider,
  Grid,
  Label,
} from '@patternfly/react-core';

import { ERROR } from './utils/constants';
import { getVMStatuses } from './utils/utils';
import VMStatusItem from './VMStatusItem';

import './VMStatusesCard.scss';

const VMStatusesCard: React.FC = () => {
  const [activeNamespace] = useActiveNamespace();
  const namespace = React.useMemo(
    () => (activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace),
    [activeNamespace],
  );

  const { t } = useKubevirtTranslation();
  const [vms] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    namespace: namespace,
    namespaced: Boolean(namespace),
  });
  const [showExtraStatuses, setShowExtraStatuses] = React.useState<boolean>(false);

  const { additionalStatuses, primaryStatuses } = getVMStatuses(vms || []);

  return (
    <Card className="vm-statuses-card" data-test-id="vm-statuses-card">
      <CardHeader className="vm-statuses-card__header">
        <CardTitle>{t('VirtualMachine statuses')}</CardTitle>
      </CardHeader>
      <div className="vm-statuses-card__body">
        <Grid hasGutter>
          <VMStatusItem count={primaryStatuses.Error} namespace={activeNamespace} status={ERROR} />
          <VMStatusItem
            count={primaryStatuses.Running}
            namespace={activeNamespace}
            status={VM_STATUS.Running}
          />
          <VMStatusItem
            count={primaryStatuses.Paused}
            namespace={activeNamespace}
            status={VM_STATUS.Paused}
          />
          <VMStatusItem
            count={primaryStatuses.Migrating}
            namespace={activeNamespace}
            status={VM_STATUS.Migrating}
          />
        </Grid>
      </div>
      <Divider />
      <div className="vm-statuses-card__accordion">
        <Accordion>
          <AccordionItem>
            <AccordionToggle
              className="vm-statuses-card__accordion-toggle"
              id="status-accordion-toggle"
              isExpanded={showExtraStatuses}
              onClick={() => setShowExtraStatuses(!showExtraStatuses)}
            >
              <span className="vm-statuses-card__accordion-toggle--text">
                {t('Additional statuses')}
              </span>
              <Label
                className="vm-statuses-card__accordion-toggle--label"
                isCompact
                key="vm-status-accordion-toggle-label"
              >
                {Object.keys(additionalStatuses).length}
              </Label>
            </AccordionToggle>
            <Divider />
            <AccordionContent
              className="vm-statuses-card__accordion-content"
              id="status-accordion-content"
              isHidden={!showExtraStatuses}
            >
              <Grid hasGutter>
                {Object.keys(additionalStatuses)?.map((state) => {
                  const count = additionalStatuses?.[state];
                  return (
                    <VMStatusItem
                      count={count}
                      key={state}
                      namespace={activeNamespace}
                      status={state}
                    />
                  );
                })}
              </Grid>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Card>
  );
};

export default VMStatusesCard;
