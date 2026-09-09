// Extracted from prompts.ts
// Root: src/views/lightspeed/utils/prompts.ts

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { isErrorPrintableStatus } from '@virtualmachines/utils';

import { STATIC_PROMPT_MESSAGES_A } from './promptMessagesA';
import { STATIC_PROMPT_MESSAGES_B } from './promptMessagesB';
import { OLSPromptType } from './promptTypes';

type PromptData = {
  vm?: V1VirtualMachine;
};

export const getOLSPrompt = (promptType: OLSPromptType, data?: PromptData): string => {
  const vm = data?.vm;
  const vmPrintableStatus = getVMStatus(vm);
  const isErrorStatus = isErrorPrintableStatus(vmPrintableStatus);

  if (promptType === OLSPromptType.VM_STATUS) {
    return `Provide a detailed explanation for why a VirtualMachine would have a status of ${vmPrintableStatus}${
      isErrorStatus ? 'and provide troubleshooting steps for how to fix it' : ''
    }.`;
  }

  if (promptType === OLSPromptType.VM_STATUS_CONCISE) {
    return `Provide a very concise explanation for why a VirtualMachine would have a status of ${vmPrintableStatus}. Don't provide troubleshooting steps and don't add phrases indicating that this response is intended to brief. Attempt to limit the response to no more than two sentences`;
  }

  return STATIC_PROMPT_MESSAGES_A[promptType] ?? STATIC_PROMPT_MESSAGES_B[promptType] ?? '';
};
