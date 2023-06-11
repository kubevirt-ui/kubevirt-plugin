import { useMemo } from 'react';

import {
  ALERT_NAME_LABEL_KEY,
  SILENCES_URL,
  URL_POLL_DEFAULT_DELAY,
} from '@kubevirt-utils/hooks/useSilences/utils/constants';
import { Silence } from '@openshift-console/dynamic-plugin-sdk';
import { useURLPoll } from '@openshift-console/dynamic-plugin-sdk-internal';

type UseSilences = () => {
  loaded: boolean;
  loadError: any;
  silences: Silence[];
};

const useSilences: UseSilences = () => {
  const [response, loadError, loading] = useURLPoll<Silence[]>(
    SILENCES_URL,
    URL_POLL_DEFAULT_DELAY,
  );

  const silencesWithAlertName = useMemo(() => {
    return response?.map((silence: Silence) => {
      const alertName = silence?.matchers?.find(
        (matcher) => matcher?.name === ALERT_NAME_LABEL_KEY,
      )?.value;

      return {
        ...silence,
        name:
          alertName ||
          silence?.matchers
            .map((matcher) => `${matcher?.name}${matcher?.isRegex ? '=~' : '='}${matcher?.value}`)
            .join(', '),
      };
    });
  }, [response]);

  return { loaded: !loading, loadError, silences: silencesWithAlertName };
};

export default useSilences;
