import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Divider,
  Grid,
  Label,
} from '@patternfly/react-core';

import VMStatusItem from './VMStatusItem';

type statusItemData = {
  count: number;
  id: string;
  statuses: Record<string, number>;
  title: string;
};

type VMAdditionalStatusesProps = {
  activeNamespace: string;
  otherStatuses: Record<string, number>;
  otherStatusesCount: number;
};

const VMAdditionalStatuses: FC<VMAdditionalStatusesProps> = ({
  activeNamespace,
  otherStatuses,
  otherStatusesCount,
}) => {
  const { t } = useKubevirtTranslation();
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({
    otherStatuses: false,
  });

  const getStatusItems = (): statusItemData[] => [
    {
      count: otherStatusesCount,
      id: 'otherStatuses',
      statuses: otherStatuses,
      title: t('Other statuses'),
    },
  ];

  const statusItems = getStatusItems();

  const toggleAccordion = (accordionId: string) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [accordionId]: !prev[accordionId],
    }));
  };

  const renderStatusItems = (statuses: Record<string, number>) => {
    return Object.keys(statuses)?.map((state) => {
      const count = statuses?.[state];
      return (
        <VMStatusItem
          count={count}
          key={state}
          namespace={activeNamespace}
          showIcon={false}
          statusArray={[state as VM_STATUS]}
          statusLabel={state}
        />
      );
    });
  };

  return (
    <div className="vm-statuses-card__accordion">
      <Accordion>
        {statusItems.map((item) => (
          <AccordionItem isExpanded={expandedAccordions[item.id]} key={item.id}>
            <AccordionToggle
              className="vm-statuses-card__accordion-toggle"
              id={`${item.id}-accordion-toggle`}
              onClick={() => toggleAccordion(item.id)}
            >
              <span className="vm-statuses-card__accordion-toggle--text">{item.title}</span>
              <Label
                className="vm-statuses-card__accordion-toggle--label"
                isCompact
                key={`vm-status-accordion-toggle-label-${item.id}`}
              >
                {item.count}
              </Label>
            </AccordionToggle>
            <Divider />
            <AccordionContent
              className="vm-statuses-card__accordion-content"
              id={`${item.id}-accordion-content`}
            >
              <Grid hasGutter>{renderStatusItems(item.statuses)}</Grid>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default VMAdditionalStatuses;
