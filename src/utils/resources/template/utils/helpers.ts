// Only used for replacing parameters in the template, do not use for anything else

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';

// eslint-disable-next-line require-jsdoc
export const poorManProcess = (template: V1Template): V1Template => {
  if (!template) return null;

  let templateString = JSON.stringify(template);

  template.parameters
    .filter((p) => p.value)
    .forEach((p) => {
      templateString = templateString.replaceAll(`\${${p.name}}`, p.value);
    });

  return JSON.parse(templateString);
};
