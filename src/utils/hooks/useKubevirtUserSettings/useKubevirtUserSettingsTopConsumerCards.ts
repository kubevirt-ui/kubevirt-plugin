import { useEffect, useMemo, useRef } from 'react';

import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import useLocalStorage from '../useLocalStorage';

import {
  SHOW_TOP_5_ITEMS,
  TOP_CONSUMERS_DURATION_KEY,
  TOP_CONSUMERS_NUM_ITEMS_KEY,
} from './../../../views/clusteroverview/TopConsumersTab/utils/constants';
import { initialTopConsumerCardSettings } from './../../../views/clusteroverview/TopConsumersTab/utils/utils';
import useKubevirtUserSettings from './useKubevirtUserSettings';
import { TOP_CONSUMERS_CARD, USER_SETTINGS_KEYS } from './utils/const';
import { type TopConsumersData, type UseKubevirtUserSettingsTopConsumerCards } from './utils/types';

const useKubevirtUserSettingsTopConsumerCards: UseKubevirtUserSettingsTopConsumerCards = () => {
  const updateOnceFromUserSettingRef = useRef(null);
  const [cards, setCards, loaded] = useKubevirtUserSettings(USER_SETTINGS_KEYS.cards);
  const [topConsumerSettingsLocalStorage, setTopConsumerSettingsLocalStorage] =
    useLocalStorage<TopConsumersData>(TOP_CONSUMERS_CARD);

  useEffect(() => {
    if (!updateOnceFromUserSettingRef.current && loaded) {
      if (cards?.[TOP_CONSUMERS_CARD]) {
        setTopConsumerSettingsLocalStorage({
          ...cards?.[TOP_CONSUMERS_CARD],
        });
      }
      if (!cards?.[TOP_CONSUMERS_CARD]) {
        setTopConsumerSettingsLocalStorage({
          [TOP_CONSUMERS_DURATION_KEY]: DurationOption.THIRTY_MIN.toString(),
          [TOP_CONSUMERS_NUM_ITEMS_KEY]: SHOW_TOP_5_ITEMS,
          ...initialTopConsumerCardSettings,
        } as TopConsumersData);
      }
      updateOnceFromUserSettingRef.current = true;
      return;
    }

    if (!isEqualObject(topConsumerSettingsLocalStorage, cards?.[TOP_CONSUMERS_CARD])) {
      setCards?.({ [TOP_CONSUMERS_CARD]: topConsumerSettingsLocalStorage }).catch(
        kubevirtConsole.error,
      );
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
        setTopConsumerSettingsLocalStorage({
          ...topConsumerSettingsLocalStorage,
          [field]: value,
        } as TopConsumersData),
    [setTopConsumerSettingsLocalStorage, topConsumerSettingsLocalStorage],
  );

  return [topConsumerSettingsLocalStorage, setLocalStorageData];
};

export default useKubevirtUserSettingsTopConsumerCards;
