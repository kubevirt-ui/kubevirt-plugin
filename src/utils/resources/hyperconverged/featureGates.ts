import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import { type Patch } from '@openshift-console/dynamic-plugin-sdk';

import { isHyperConvergedV1 } from './model';
import {
  featureGateNamesMatch,
  getHCOFeatureGateEntries,
  getHCOFeatureGatesV1Beta1,
  isFeatureGateEnabled,
} from './selectors';
import { HCO_FEATURE_GATE_STATE, type HCOFeatureGateEntry, type HyperConverged } from './types';

const FEATURE_GATES_PATH = '/spec/featureGates';

type BuildFeatureGatePatchesProps = {
  gateName: string;
  hyperConverged: HyperConverged;
  isEnabled: boolean;
};

const buildNextV1FeatureGateEntries = (
  gates: HCOFeatureGateEntry[],
  gateName: string,
  isEnabled: boolean,
): HCOFeatureGateEntry[] => {
  const remainingGates = gates.filter((gate) => !featureGateNamesMatch(gate.name, gateName));

  return [
    ...remainingGates,
    {
      name: gateName,
      ...(!isEnabled && { state: HCO_FEATURE_GATE_STATE.Disabled }),
    },
  ];
};

const buildV1FeatureGatePatches = ({
  gateName,
  hyperConverged,
  isEnabled,
}: BuildFeatureGatePatchesProps): Patch[] => {
  const nextFeatureGates = buildNextV1FeatureGateEntries(
    getHCOFeatureGateEntries(hyperConverged),
    gateName,
    isEnabled,
  );

  if (!hyperConverged.spec?.featureGates) {
    return [{ op: K8S_OPS.ADD, path: FEATURE_GATES_PATH, value: nextFeatureGates }];
  }

  return [{ op: K8S_OPS.REPLACE, path: FEATURE_GATES_PATH, value: nextFeatureGates }];
};

const buildV1Beta1FeatureGatePatches = ({
  gateName,
  hyperConverged,
  isEnabled,
}: BuildFeatureGatePatchesProps): Patch[] => {
  const featureGates = getHCOFeatureGatesV1Beta1(hyperConverged);
  const hasGate = Boolean(featureGates && gateName in featureGates);

  return [
    ...(!featureGates ? [{ op: K8S_OPS.ADD, path: FEATURE_GATES_PATH, value: {} }] : []),
    {
      op: hasGate ? K8S_OPS.REPLACE : K8S_OPS.ADD,
      path: `${FEATURE_GATES_PATH}/${gateName}`,
      value: isEnabled,
    },
  ];
};

export const buildFeatureGatePatches = (
  hyperConverged: HyperConverged,
  gateName: string,
  isEnabled: boolean,
): Patch[] => {
  if (isFeatureGateEnabled(hyperConverged, gateName) === isEnabled) {
    return [];
  }

  const buildPatches = isHyperConvergedV1(hyperConverged)
    ? buildV1FeatureGatePatches
    : buildV1Beta1FeatureGatePatches;

  return buildPatches({ gateName, hyperConverged, isEnabled });
};
