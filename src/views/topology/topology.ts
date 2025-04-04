export { default as useModifyApplicationActionProvider } from './hooks/useModifyApplicationActionProvider';
export { default as useVMSidePanelDetailsTabSection } from './hooks/useVMSidePanelDetailsTabSection';
export { isKubevirtResource as isResourceDepicted } from './utils/is-kubevirt-resource';
export { getKubevirtComponentFactory as kubevirtComponentFactory } from './utils/kubevirt-component-factory';
export { getKubevirtTopologyDataModel as getKubevirtDataModel } from './utils/kubevirt-data-transformer';
export {
  getVMSideBarResourceLink,
  getVMSidePanelNetworkAdapter,
  getVMSidePanelPodsAdapter,
} from './utils/vm-tab-sections';
