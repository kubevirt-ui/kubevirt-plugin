import { useEffect, useMemo, useRef } from 'react';

import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';

import useLocalStorage from '../useLocalStorage';

import {
  SHOW_TOP_5_ITEMS,
  TOP_CONSUMERS_DURATION_KEY,
  TOP_CONSUMERS_NUM_ITEMS_KEY,
} from './../../../views/clusteroverview/TopConsumersTab/utils/constants';
import { initialTopConsumerCardSettings } from './../../../views/clusteroverview/TopConsumersTab/utils/utils';
import { TOP_CONSUMERS_CARD } from './utils/const';
import { TopConsumersData, UseKubevirtUserSettingsTopConsumerCards } from './utils/types';
import useKubevirtUserSettings from './useKubevirtUserSettings';

const useKubevirtUserSettingsTopConsumerCards: UseKubevirtUserSettingsTopConsumerCards = () => {
  const updateOnceFromUserSetting = useRef(null);
  const [cards, setCards, loaded] = useKubevirtUserSettings('cards');
  const [topConsumerSettingsLocalStorage, setTopConsumerSettingsLocalStorage] =
    useLocalStorage<TopConsumersData>(TOP_CONSUMERS_CARD);

  useEffect(() => {
    if (!updateOnceFromUserSetting.current && loaded) {
      if (cards?.[TOP_CONSUMERS_CARD]) {
        setTopConsumerSettingsLocalStorage({
          ...cards?.[TOP_CONSUMERS_CARD],
        });
      }
      if (!cards?.[TOP_CONSUMERS_CARD]) {
        setTopConsumerSettingsLocalStorage(
          JSON.stringify({
            [TOP_CONSUMERS_DURATION_KEY]: DurationOption.THIRTY_MIN.toString(),
            [TOP_CONSUMERS_NUM_ITEMS_KEY]: SHOW_TOP_5_ITEMS,
            ...initialTopConsumerCardSettings,
          }),
        );
      }
      updateOnceFromUserSetting.current = true;
      return;
    }

    if (!isEqualObject(topConsumerSettingsLocalStorage, cards?.[TOP_CONSUMERS_CARD])) {
      setCards?.({ [TOP_CONSUMERS_CARD]: topConsumerSettingsLocalStorage });
    }
  }, [
    cards,
    topConsumerSettingsLocalStorage,
    setCards,
    setTopConsumerSettingsLocalStorage,
    loaded,
  ]);

  const setLocalStorageData = useMemo(
    () =>
      <T>(field: string, value: T): void =>
        setTopConsumerSettingsLocalStorage(
          JSON.stringify({ ...topConsumerSettingsLocalStorage, [field]: value }),
        ),
    [setTopConsumerSettingsLocalStorage, topConsumerSettingsLocalStorage],
  );

  return [topConsumerSettingsLocalStorage, setLocalStorageData];
};

export default useKubevirtUserSettingsTopConsumerCards;
