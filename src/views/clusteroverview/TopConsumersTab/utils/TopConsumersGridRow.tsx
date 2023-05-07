import React, { FC } from 'react';
import classNames from 'classnames';

import {
  SetTopConsumerData,
  TopConsumersData,
} from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import { Grid, GridItem } from '@patternfly/react-core';

import TopConsumerCard from './TopConsumerCard';
import { getTopConsumerCardID } from './utils';

import './TopConsumersGridRow.scss';

type TopConsumersGridRowProps = {
  rowNumber: number;
  topGrid?: boolean;
  localStorageData: TopConsumersData;
  setLocalStorageData: SetTopConsumerData;
};

const TopConsumersGridRow: FC<TopConsumersGridRowProps> = ({
  rowNumber,
  topGrid = false,
  localStorageData,
  setLocalStorageData,
}) => {
  const classes = classNames('kv-top-consumers-card__grid', {
    'kv-top-consumers-card__top-grid': topGrid,
  });

  return (
    <Grid className={classes}>
      {Array.from({ length: 3 }, (_, i) => {
        const cardID = getTopConsumerCardID(rowNumber, i + 1);
        return (
          <GridItem span={4} key={cardID} className="kv-top-consumers-card__card-grid-item">
            <TopConsumerCard
              localStorageData={localStorageData}
              setLocalStorageData={setLocalStorageData}
              cardID={cardID}
            />
          </GridItem>
        );
      })}
    </Grid>
  );
};

export default TopConsumersGridRow;
