import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import { isHyperConvergedV1 } from '@kubevirt-utils/resources/hyperconverged/model';
import {
  buildHyperConvergedPatches,
  getAAQConfigPatchPath,
  getAAQEnabledPatchPath,
} from '@kubevirt-utils/resources/hyperconverged/patchUtils';
import {
  type HyperConverged,
  type HyperConvergedV1,
  type HyperConvergedV1Beta1,
} from '@kubevirt-utils/resources/hyperconverged/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type Patch } from '@openshift-console/dynamic-plugin-sdk';

import { DEFAULT_CALCULATION_METHOD } from './constants';

const buildV1EnablePatches = (hyperConverge: HyperConvergedV1, checked: boolean): Patch[] => {
  const configPath = getAAQConfigPatchPath(hyperConverge);
  const existingConfig = hyperConverge?.spec?.deployment?.applicationAwareConfig;

  return buildHyperConvergedPatches(hyperConverge, [
    {
      op: isEmpty(existingConfig) ? K8S_OPS.ADD : K8S_OPS.REPLACE,
      path: configPath,
      value: {
        allowApplicationAwareClusterResourceQuota: true,
        enable: checked,
        vmiCalcConfigName: existingConfig?.vmiCalcConfigName ?? DEFAULT_CALCULATION_METHOD,
      },
    },
  ]);
};

const buildV1Beta1EnablePatches = (
  hyperConverge: HyperConvergedV1Beta1,
  checked: boolean,
): Patch[] => {
  const enabledPath = getAAQEnabledPatchPath(hyperConverge);
  const configPath = getAAQConfigPatchPath(hyperConverge);

  return [
    {
      op:
        hyperConverge?.spec?.enableApplicationAwareQuota === undefined
          ? K8S_OPS.ADD
          : K8S_OPS.REPLACE,
      path: enabledPath,
      value: checked,
    },
    {
      op: isEmpty(hyperConverge?.spec?.applicationAwareConfig) ? K8S_OPS.ADD : K8S_OPS.REPLACE,
      path: configPath,
      value: {
        allowApplicationAwareClusterResourceQuota: true,
        vmiCalcConfigName:
          hyperConverge?.spec?.applicationAwareConfig?.vmiCalcConfigName ??
          DEFAULT_CALCULATION_METHOD,
      },
    },
  ];
};

export const buildAAQEnablePatches = (hyperConverge: HyperConverged, checked: boolean): Patch[] => {
  if (isHyperConvergedV1(hyperConverge)) {
    return buildV1EnablePatches(hyperConverge, checked);
  }
  return buildV1Beta1EnablePatches(hyperConverge as HyperConvergedV1Beta1, checked);
};
