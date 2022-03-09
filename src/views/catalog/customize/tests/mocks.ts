/* eslint-disable @typescript-eslint/no-var-requires */
import {
  PersistentVolumeClaimModel,
  ProjectModel,
  TemplateModel,
} from '@kubevirt-ui/kubevirt-api/console';

export const getMockTemplate = () => JSON.parse(JSON.stringify(require('./data/template.json')));

export const getPVCs = () => JSON.parse(JSON.stringify(require('./data/pvcs.json')));

export const getProjects = () => JSON.parse(JSON.stringify(require('./data/projects.json')));

export const mockUseK8sWatchResource = jest
  .fn()
  .mockImplementation(({ groupVersionKind: { kind } }) => {
    if (kind === ProjectModel.kind) return [getProjects(), true];
    else if (kind === PersistentVolumeClaimModel.kind) return [getPVCs(), true];
    else if (kind === TemplateModel.kind) return [getMockTemplate(), true];
  });

export const k8sCreateTemplateRejectRequiredFields = {
  kind: 'Status',
  apiVersion: 'v1',
  metadata: {},
  status: 'Failure',
  message:
    'Template.template.openshift.io "rhel8-saphana-tiny" is invalid: [template.parameters[1]: Required value: template.parameters[1]: parameter WORKLOAD_NODE_LABEL_VALUE is required and must be specified, template.parameters[7]: Required value: template.parameters[7]: parameter SRIOV_NETWORK_NAME1 is required and must be specified, template.parameters[8]: Required value: template.parameters[8]: parameter SRIOV_NETWORK_NAME2 is required and must be specified, template.parameters[9]: Required value: template.parameters[9]: parameter SRIOV_NETWORK_NAME3 is required and must be specified]',
  reason: 'Invalid',
  details: {
    name: 'rhel8-saphana-tiny',
    group: 'template.openshift.io',
    kind: 'Template',
    causes: [
      {
        reason: 'FieldValueRequired',
        message:
          'Required value: template.parameters[1]: parameter WORKLOAD_NODE_LABEL_VALUE is required and must be specified',
        field: 'template.parameters[1]',
      },
      {
        reason: 'FieldValueRequired',
        message:
          'Required value: template.parameters[7]: parameter SRIOV_NETWORK_NAME1 is required and must be specified',
        field: 'template.parameters[7]',
      },
      {
        reason: 'FieldValueRequired',
        message:
          'Required value: template.parameters[8]: parameter SRIOV_NETWORK_NAME2 is required and must be specified',
        field: 'template.parameters[8]',
      },
      {
        reason: 'FieldValueRequired',
        message:
          'Required value: template.parameters[9]: parameter SRIOV_NETWORK_NAME3 is required and must be specified',
        field: 'template.parameters[9]',
      },
    ],
  },
  code: 422,
};
