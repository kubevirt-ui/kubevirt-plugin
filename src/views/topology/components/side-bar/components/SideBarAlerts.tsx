import React from 'react';

import { USERSETTINGS_PREFIX, useUserSettings } from '@console/shared';
import {
  DetailsResourceAlert,
  DetailsResourceAlertContent,
  isDetailsResourceAlert,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';
import { GraphElement, observer } from '@patternfly/react-topology';

const SIDEBAR_ALERTS = 'sideBarAlerts';

const ResolveResourceAlerts: React.FC<{
  id?: string;
  useResourceAlertsContent?: (element: GraphElement) => DetailsResourceAlertContent;
  element: GraphElement;
}> = observer(function ResolveResourceAlerts({ id, useResourceAlertsContent, element }) {
  const [showAlert, setShowAlert, loaded] = useUserSettings(
    `${USERSETTINGS_PREFIX}.${SIDEBAR_ALERTS}.${id}.${element.getId()}`,
    true,
  );
  const alertConfigs = useResourceAlertsContent(element);
  if (!alertConfigs) return null;
  const { variant, content, actionLinks, dismissible, title } = alertConfigs;
  return loaded && showAlert ? (
    <Alert
      isInline
      variant={variant}
      title={title}
      actionLinks={actionLinks}
      actionClose={
        dismissible && (
          <AlertActionCloseButton
            onClose={() => {
              setShowAlert(false);
            }}
          />
        )
      }
    >
      {content}
    </Alert>
  ) : null;
});

const SideBarAlerts: React.FC<{ element: GraphElement }> = ({ element }) => {
  const [resourceAlertsExtension, resolved] =
    useResolvedExtensions<DetailsResourceAlert>(isDetailsResourceAlert);
  return resolved ? (
    <>
      {resourceAlertsExtension.map(({ uid, properties: { contentProvider, ...props } }) => {
        const key = `${uid}-${element.getId()}`;
        return (
          <ResolveResourceAlerts
            key={key}
            {...props}
            useResourceAlertsContent={contentProvider}
            element={element}
          />
        );
      })}
    </>
  ) : null;
};

export default SideBarAlerts;
