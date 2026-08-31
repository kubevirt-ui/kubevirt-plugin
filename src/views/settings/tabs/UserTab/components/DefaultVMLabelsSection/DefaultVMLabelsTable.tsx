import React, { type FC, useCallback, useEffect, useState } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import useAutoAppliedLabels from '@kubevirt-utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Content,
  ContentVariants,
  Grid,
  GridItem,
  Skeleton,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import DefaultVMLabelRow from './components/DefaultVMLabelRow';

const DefaultVMLabelsTable: FC = () => {
  const { t } = useKubevirtTranslation();
  const { error: adminError, labels, loaded: adminLoaded } = useAutoAppliedLabels();
  const [userValues, setUserValues, userLoaded, userError] = useKubevirtUserSettings(
    USER_SETTINGS_KEYS.defaultVMLabels,
  );

  const loaded = adminLoaded && userLoaded;
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (loaded) {
      setHasLoadedOnce(true);
    }
  }, [loaded]);

  const onValueChange = useCallback(
    (key: string, value: string): void => {
      void setUserValues({ ...(userValues ?? {}), [key]: value });
    },
    [setUserValues, userValues],
  );

  if (!hasLoadedOnce) {
    return <Skeleton />;
  }

  return (
    <Stack hasGutter>
      {(adminError ?? userError) && (
        <StackItem>
          <ErrorAlert error={adminError ?? userError} />
        </StackItem>
      )}

      {isEmpty(labels) ? (
        <StackItem>
          <Content component={ContentVariants.p}>
            {t('No auto-applied labels have been configured by an administrator.')}
          </Content>
        </StackItem>
      ) : (
        <>
          <StackItem>
            <Grid hasGutter>
              <GridItem span={5}>
                <Content component={ContentVariants.h6}>{t('Key')}</Content>
              </GridItem>
              <GridItem span={7}>
                <Content component={ContentVariants.h6}>{t('Value')}</Content>
              </GridItem>
            </Grid>
          </StackItem>

          {labels.map((label) => (
            <StackItem key={label.key}>
              <DefaultVMLabelRow
                label={label}
                onValueChange={onValueChange}
                userValue={userValues?.[label.key] as string}
              />
            </StackItem>
          ))}
        </>
      )}
    </Stack>
  );
};

export default DefaultVMLabelsTable;
