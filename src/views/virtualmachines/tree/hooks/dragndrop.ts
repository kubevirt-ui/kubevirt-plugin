import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import { DRAG_N_DROP_LISTENERS, VALID_DRAG_TARGET_BACKGROUND_COLOR } from './constants';

let draggingVMNamespace: null | string = null;

export const changeVMFolder = (vmName: string, vmNamespace: string, newFolder: string) =>
  k8sPatch({
    data: [
      {
        op: 'add',
        path: `/metadata/labels`,
        value: {},
      },
      {
        op: 'replace',
        path: `/metadata/labels/${VM_FOLDER_LABEL?.replace('/', '~1')}`,
        value: newFolder,
      },
    ],
    model: VirtualMachineModel,
    resource: {
      apiVersion: VirtualMachineModel.apiVersion,
      kind: VirtualMachineModel.kind,
      metadata: { name: vmName, namespace: vmNamespace },
    },
  });

const dragStartHandler = (ev) => {
  const elementId = ev.target.id as string;
  ev.dataTransfer.setData('application/treeViewElementID', elementId);
  ev.dataTransfer.effectAllowed = 'all';

  ev.target.style.backgroundColor = 'unset';

  const [namespace, _] = elementId.split('/');
  draggingVMNamespace = namespace;
};

type RemoveListenerFunction = () => void;

export const addDragEventListener = (treeViewItem: TreeViewDataItem): RemoveListenerFunction => {
  const vmHTMLElement = document.getElementById(treeViewItem.id);

  if (!vmHTMLElement) return;

  vmHTMLElement.draggable = true;
  vmHTMLElement.addEventListener(DRAG_N_DROP_LISTENERS.DRAG_START, dragStartHandler);

  return () =>
    vmHTMLElement.removeEventListener(DRAG_N_DROP_LISTENERS.DRAG_START, dragStartHandler);
};

export const dropEventListeners = (treeViewItem: TreeViewDataItem): RemoveListenerFunction => {
  const folderHTMLElement = document.getElementById(treeViewItem.id);

  const [_, folderNamespace, folderName] = treeViewItem.id.split('/');

  if (!folderHTMLElement || !folderName) return null;

  const dropHandler = (ev) => {
    ev.preventDefault();
    // Get the id of the target and add the moved element to the target's DOM
    const vmID = ev.dataTransfer.getData('application/treeViewElementID');

    const [namespace, name] = vmID.split('/');

    changeVMFolder(name, namespace, folderName);

    folderHTMLElement.style.backgroundColor = 'unset';
  };

  const dragOverHandler = (ev) => {
    const dragAllowed = draggingVMNamespace === folderNamespace;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = dragAllowed ? 'move' : 'none';

    folderHTMLElement.style.backgroundColor = dragAllowed
      ? VALID_DRAG_TARGET_BACKGROUND_COLOR
      : 'var(--pf-t--global--color--nonstatus--red--hover)';
  };

  const dragLeaveHandler = (ev) => {
    ev.preventDefault();
    folderHTMLElement.style.backgroundColor = 'unset';
  };

  folderHTMLElement.addEventListener(DRAG_N_DROP_LISTENERS.DROP, dropHandler);
  folderHTMLElement.addEventListener(DRAG_N_DROP_LISTENERS.DRAG_OVER, dragOverHandler);
  folderHTMLElement.addEventListener(DRAG_N_DROP_LISTENERS.DRAG_LEAVE, dragLeaveHandler);

  return () => {
    folderHTMLElement.removeEventListener(DRAG_N_DROP_LISTENERS.DROP, dropHandler);
    folderHTMLElement.removeEventListener(DRAG_N_DROP_LISTENERS.DRAG_OVER, dragOverHandler);
    folderHTMLElement.removeEventListener(DRAG_N_DROP_LISTENERS.DRAG_LEAVE, dragLeaveHandler);
  };
};
