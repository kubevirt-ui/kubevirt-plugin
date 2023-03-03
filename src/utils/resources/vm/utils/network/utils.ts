import { NetworkPresentation } from './constants';
import { getPrintableNetworkInterfaceType } from './selectors';

export const nicsSorting = (nics: NetworkPresentation[], direction: string) =>
  nics.sort((a: NetworkPresentation, b: NetworkPresentation) => {
    const aUpdated = getPrintableNetworkInterfaceType(a.iface);
    const bUpdated = getPrintableNetworkInterfaceType(b.iface);

    if (aUpdated && bUpdated) {
      return direction === 'asc'
        ? aUpdated.localeCompare(bUpdated)
        : bUpdated.localeCompare(aUpdated);
    }
  });
