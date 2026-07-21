import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardBody,
  CardHeader,
  GridItem,
  Label,
  Radio,
  Split,
  SplitItem,
} from '@patternfly/react-core';

import { CapabilitiesView, type SelectionCardConfig } from '../../utils/types';
import InstallBundleButton from '../InstallBundleButton/InstallBundleButton';
import InstallSelectedButton from '../InstallSelectedButton/InstallSelectedButton';

import './SelectionCard.scss';

type SelectionCardProps = {
  config: SelectionCardConfig;
  isSelected: boolean;
  onSelect: (view: CapabilitiesView) => void;
};

const SelectionCard: FC<SelectionCardProps> = ({ config, isSelected, onSelect }) => {
  const { t } = useKubevirtTranslation();
  const { description, id, label, showRecommendedBadge } = config;

  return (
    <GridItem span={4}>
      <Card
        className={isSelected ? 'recommended-capabilities__selection-card--selected' : undefined}
        isClickable
        isFullHeight
        isSelectable
        isSelected={isSelected}
        onClick={() => onSelect(id)}
      >
        <CardHeader>
          <Split hasGutter>
            <SplitItem>
              <Radio
                id={`radio-${id}`}
                isChecked={isSelected}
                name={`capabilities-${id}`}
                onChange={() => onSelect(id)}
                value={id}
              />
            </SplitItem>
            <SplitItem isFilled>
              <Split hasGutter>
                <SplitItem>{label}</SplitItem>
                {showRecommendedBadge && (
                  <SplitItem>
                    <Label color="blue" isCompact>
                      {t('Recommended')}
                    </Label>
                  </SplitItem>
                )}
              </Split>
            </SplitItem>
            {isSelected && (
              <SplitItem>
                {id === CapabilitiesView.Bundle ? <InstallBundleButton /> : <InstallSelectedButton />}
              </SplitItem>
            )}
          </Split>
        </CardHeader>
        <CardBody>{description}</CardBody>

      </Card>
    </GridItem>
  );
};

export default SelectionCard;
