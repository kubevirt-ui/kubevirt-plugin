import useVMSidePanelDetailsTabSectionHook from './hooks/useVMSidePanelDetailsTabSection';
import {
  getVMSidePanelNetworkAdapter as getVMSidePanelNetworkAdapter2,
  getVMSidePanelPodsAdapter as getVMSidePanelPodsAdapter2,
} from './utils/vm-tab-sections';

export const useVMSidePanelDetailsTabSection = useVMSidePanelDetailsTabSectionHook;
export const getVMSidePanelPodsAdapter = getVMSidePanelPodsAdapter2;
export const getVMSidePanelNetworkAdapter = getVMSidePanelNetworkAdapter2;
