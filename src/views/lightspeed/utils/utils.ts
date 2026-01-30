import { dump as dumpYAML } from 'js-yaml';

import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { DEFAULT_MAX_EVENTS, OLS_SUBMIT_BUTTON_ELEMENT_CLASS } from '@lightspeed/utils/constants';
import { OLSAttachment, OLSAttachmentTypes } from '@lightspeed/utils/types';
import { EventKind } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';

const getPromptSubmitButton = (): HTMLButtonElement =>
  document.getElementsByClassName(OLS_SUBMIT_BUTTON_ELEMENT_CLASS)[0] as HTMLButtonElement;

// This function clicks the Lightspeed submit button in the Lightspeed drawer
export const clickOLSPromptSubmitButton = () => {
  return new Promise((resolve) => {
    const existingButton = getPromptSubmitButton();
    if (existingButton) {
      existingButton.click();
      resolve(existingButton);
      return;
    }

    const observer = new MutationObserver((_) => {
      const button = getPromptSubmitButton();
      if (button) {
        button.click();
        observer.disconnect();
        resolve(button);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
};

const asYAML = (input: any) => {
  try {
    return dumpYAML(input, { lineWidth: -1 }).trim();
  } catch (e) {
    kubevirtConsole.error('Error converting YAML: ', e);
  }
};

export const asOLSYAMLAttachment = (obj: K8sResourceCommon): OLSAttachment => ({
  attachmentType: OLSAttachmentTypes.YAML,
  kind: obj?.kind,
  name: getName(obj),
  namespace: getNamespace(obj),
  ownerName: null,
  value: asYAML(obj),
});

export const asOLSEventsAttachment = (
  obj: K8sResourceCommon,
  events: EventKind[],
): OLSAttachment => {
  const numEvents = Math.min(events.length, DEFAULT_MAX_EVENTS);

  return {
    attachmentType: OLSAttachmentTypes.Events,
    kind: obj?.kind,
    name: getName(obj),
    namespace: getNamespace(obj),
    ownerName: null,
    value: asYAML(events.slice(-numEvents)),
  };
};
