import { OLS_SUBMIT_BUTTON_ELEMENT_CLASS } from '@lightspeed/utils/constants';

const getPromptSubmitButton = (): HTMLButtonElement =>
  document.getElementsByClassName(OLS_SUBMIT_BUTTON_ELEMENT_CLASS)[0] as HTMLButtonElement;

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
