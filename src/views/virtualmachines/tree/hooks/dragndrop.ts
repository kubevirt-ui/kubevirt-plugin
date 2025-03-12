import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import { DRAG_N_DROP_LISTENERS } from './constants';

export const changeVMFolder = (vmName: string, vmNamespace: string, newFolder: string) =>
  k8sPatch({
    data: [
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
  ev.dataTransfer.setData('application/treeViewElementID', ev.target.id);
  ev.dataTransfer.effectAllowed = 'all';

  ev.target.style.backgroundColor = 'unset';
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

  if (!folderHTMLElement) return null;

  const dropHandler = (ev) => {
    ev.preventDefault();
    // Get the id of the target and add the moved element to the target's DOM
    const vmID = ev.dataTransfer.getData('application/treeViewElementID');

    const [_, folderNamespace, folderName] = treeViewItem.id.split('/');

    const [namespace, name] = vmID.split('/');

    if (folderNamespace !== namespace) {
      document.body.style.cursor = 'no-drop';
      return;
    }

    changeVMFolder(name, namespace, folderName);

    folderHTMLElement.style.backgroundColor = 'unset';
  };

  const dragOverHandler = (ev) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';

    folderHTMLElement.style.backgroundColor =
      'var(--pf-v6-c-tree-view__node--hover--BackgroundColor)';
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
