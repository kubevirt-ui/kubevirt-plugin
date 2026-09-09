import { useMemo } from 'react';

import {
  ALERT_NAME_LABEL_KEY,
  SILENCES_URL,
  URL_POLL_DEFAULT_DELAY,
} from '@kubevirt-utils/hooks/useSilences/utils/constants';
import { type Silence } from '@openshift-console/dynamic-plugin-sdk';
import { useURLPoll } from '@openshift-console/dynamic-plugin-sdk-internal';

type SilenceWithName = Silence & { name: string };

type UseSilences = () => {
  loaded: boolean;
  loadError: Error | undefined;
  silences: SilenceWithName[] | undefined;
};

const useSilences: UseSilences = () => {
  const pollResult = useURLPoll<Silence[]>(SILENCES_URL, URL_POLL_DEFAULT_DELAY);
  const response = pollResult[0];
  const loading = pollResult[2];
  const loadError = pollResult[1] instanceof Error ? pollResult[1] : undefined;

  const silencesWithAlertName = useMemo(() => {
    return response?.map((silence: Silence) => {
      const alertName = silence?.matchers?.find(
        (matcher) => matcher?.name === ALERT_NAME_LABEL_KEY,
      )?.value;

      return {
        ...silence,
        name:
          alertName ??
          silence?.matchers
            .map((matcher) => `${matcher?.name}${matcher?.isRegex ? '=~' : '='}${matcher?.value}`)
            .join(', '),
      };
    });
  }, [response]);

  return { loaded: !loading, loadError, silences: silencesWithAlertName };
};

export default useSilences;
