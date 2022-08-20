import * as React from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
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
    namespaced: !!namespace,
    namespace: namespace,
    isList: true,
  });
  const [showExtraStatuses, setShowExtraStatuses] = React.useState<boolean>(false);

  const { primaryStatuses, additionalStatuses } = getVMStatuses(vms || []);

  return (
    <Card data-test-id="vm-statuses-card" className="vm-statuses-card">
      <CardHeader className="vm-statuses-card__header">
        <CardTitle>{t('VirtualMachine statuses')}</CardTitle>
      </CardHeader>
      <div className="vm-statuses-card__body">
        <Grid hasGutter>
          <VMStatusItem status={ERROR} count={primaryStatuses.Error} namespace={activeNamespace} />
          <VMStatusItem
            status={VM_STATUS.Running}
            count={primaryStatuses.Running}
            namespace={activeNamespace}
          />
          <VMStatusItem
            status={VM_STATUS.Paused}
            count={primaryStatuses.Paused}
            namespace={activeNamespace}
          />
          <VMStatusItem
            status={VM_STATUS.Migrating}
            count={primaryStatuses.Migrating}
            namespace={activeNamespace}
          />
        </Grid>
      </div>
      <Divider />
      <div className="vm-statuses-card__accordion">
        <Accordion>
          <AccordionItem>
            <AccordionToggle
              onClick={() => setShowExtraStatuses(!showExtraStatuses)}
              isExpanded={showExtraStatuses}
              id="status-accordion-toggle"
              className="vm-statuses-card__accordion-toggle"
            >
              <span className="vm-statuses-card__accordion-toggle--text">
                {t('Additional statuses')}
              </span>
              <Label
                isCompact
                key="vm-status-accordion-toggle-label"
                className="vm-statuses-card__accordion-toggle--label"
              >
                {Object.keys(additionalStatuses).length}
              </Label>
            </AccordionToggle>
            <Divider />
            <AccordionContent
              id="status-accordion-content"
              className="vm-statuses-card__accordion-content"
              isHidden={!showExtraStatuses}
            >
              <Grid hasGutter>
                {Object.keys(additionalStatuses)?.map((state) => {
                  const count = additionalStatuses?.[state];
                  return (
                    <VMStatusItem
                      key={state}
                      status={state}
                      count={count}
                      namespace={activeNamespace}
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
