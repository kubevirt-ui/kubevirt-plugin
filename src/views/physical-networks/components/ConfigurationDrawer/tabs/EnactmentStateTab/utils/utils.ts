import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { EnactmentState, NodeEnactmentStateDetails } from '../../../../../utils/types';

export const filterByNodeName = (
  nodeEnactmentStateDetails: NodeEnactmentStateDetails[],
  searchInput: string,
): NodeEnactmentStateDetails[] =>
  nodeEnactmentStateDetails.filter(
    (details) => getName(details?.node)?.includes(searchInput) ?? false,
  );

export const filterByEnactmentStates = (
  nodeEnactmentStateDetails: NodeEnactmentStateDetails[],
  states: EnactmentState[],
): NodeEnactmentStateDetails[] =>
  nodeEnactmentStateDetails.filter((details) =>
    states.includes(EnactmentState[details.status as keyof typeof EnactmentState]),
  );

export const filterEnactmentStateDetails = (
  nodeEnactmentStateDetails: NodeEnactmentStateDetails[],
  searchInput: string,
  enactmentStates: EnactmentState[],
): NodeEnactmentStateDetails[] => {
  if (isEmpty(nodeEnactmentStateDetails)) return [];
  const filteredByName = filterByNodeName(nodeEnactmentStateDetails, searchInput);
  return filterByEnactmentStates(filteredByName, enactmentStates);
};
