import { dump as dumpYAML } from 'js-yaml';

import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { OLS_SUBMIT_BUTTON_ELEMENT_CLASS, OLSAttachmentTypes } from '@lightspeed/utils/constants';

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

export const asOLSAttachment = (obj: K8sResourceCommon) => {
  try {
    const yaml = dumpYAML(obj, { lineWidth: -1 }).trim();

    return {
      attachmentType: OLSAttachmentTypes.YAML,
      kind: obj?.kind,
      name: getName(obj),
      namespace: getNamespace(obj),
      ownerName: null,
      value: yaml,
    };
  } catch (e) {
    kubevirtConsole.error('**** error converting YAML: ', e);
  }
};
