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
  localStorageData: TopConsumersData;
  rowNumber: number;
  setLocalStorageData: SetTopConsumerData;
  topGrid?: boolean;
};

const TopConsumersGridRow: FC<TopConsumersGridRowProps> = ({
  localStorageData,
  rowNumber,
  setLocalStorageData,
  topGrid = false,
}) => {
  const classes = classNames('kv-top-consumers-card__grid', {
    'kv-top-consumers-card__top-grid': topGrid,
  });

  return (
    <Grid className={classes}>
      {Array.from({ length: 3 }, (_, i) => {
        const cardID = getTopConsumerCardID(rowNumber, i + 1);
        return (
          <GridItem className="kv-top-consumers-card__card-grid-item" key={cardID} span={4}>
            <TopConsumerCard
              cardID={cardID}
              localStorageData={localStorageData}
              setLocalStorageData={setLocalStorageData}
            />
          </GridItem>
        );
      })}
    </Grid>
  );
};

export default TopConsumersGridRow;
