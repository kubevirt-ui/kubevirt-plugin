import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';

import { kindToAbbr } from '../../../../utils/common-utils';

export const getKindStringAndAbbreviation = (
  kind: string,
): { kindStr: string; kindAbbr: string; kindColor: string } => {
  const kindObj = getK8sModel(kind);
  const kindStr = kindObj?.kind || kind;
  const kindColor = kindObj?.color || undefined;
  const kindAbbr = (kindObj && kindObj.abbr) || kindToAbbr(kindStr);
  return { kindStr, kindAbbr, kindColor };
};
