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

const dragStartHandler = (event) => {
  const elementId = event.target.id as string;
  event.dataTransfer.setData('application/treeViewElementID', elementId);
  event.dataTransfer.effectAllowed = 'all';

  event.target.style.backgroundColor = 'unset';

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
  const dropHTMLElement = document.getElementById(treeViewItem.id);

  const [_, dropNamespace, folderName] = treeViewItem.id.split('/');

  if (!dropHTMLElement) return null;

  const dropHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();
    // Get the id of the target and add the moved element to the target's DOM
    const vmID = event.dataTransfer.getData('application/treeViewElementID');

    const [namespace, name] = vmID.split('/');

    changeVMFolder(name, namespace, folderName);

    dropHTMLElement.style.backgroundColor = 'unset';
  };

  const dragOverHandler = (event) => {
    const dragAllowed = draggingVMNamespace === dropNamespace;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = dragAllowed ? 'move' : 'none';

    dropHTMLElement.style.backgroundColor = dragAllowed
      ? VALID_DRAG_TARGET_BACKGROUND_COLOR
      : 'var(--pf-t--global--color--nonstatus--red--hover)';
  };

  const dragLeaveHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropHTMLElement.style.backgroundColor = 'unset';
  };

  dropHTMLElement.addEventListener(DRAG_N_DROP_LISTENERS.DROP, dropHandler);
  dropHTMLElement.addEventListener(DRAG_N_DROP_LISTENERS.DRAG_OVER, dragOverHandler);
  dropHTMLElement.addEventListener(DRAG_N_DROP_LISTENERS.DRAG_LEAVE, dragLeaveHandler);

  return () => {
    dropHTMLElement.removeEventListener(DRAG_N_DROP_LISTENERS.DROP, dropHandler);
    dropHTMLElement.removeEventListener(DRAG_N_DROP_LISTENERS.DRAG_OVER, dragOverHandler);
    dropHTMLElement.removeEventListener(DRAG_N_DROP_LISTENERS.DRAG_LEAVE, dragLeaveHandler);
  };
};
