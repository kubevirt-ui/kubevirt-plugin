// Extracted from useVirtualMachineTemplatesActions.tsx
// Root: src/views/templates/actions/hooks/useVirtualMachineTemplatesActions.tsx

import { type Action } from '@openshift-console/dynamic-plugin-sdk';

import { type GetTemplateActionsParams } from './getTemplateActionHelpers';
import { getTemplateEditActions } from './getTemplateEditActions';
import { getTemplateMetadataActions } from './getTemplateMetadataActions';

export type { GetTemplateActionsParams } from './getTemplateActionHelpers';

export const getTemplateActions = (params: GetTemplateActionsParams): Action[] => [
  ...getTemplateEditActions(params),
  ...getTemplateMetadataActions(params),
];
