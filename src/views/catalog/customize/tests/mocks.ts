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
