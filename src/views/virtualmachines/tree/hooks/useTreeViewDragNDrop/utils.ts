import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
  VM_FOLDER_LABEL,
} from '@virtualmachines/tree/utils/constants';

export const getVMsFromTreeData = (treeData: TreeViewDataItem[]): TreeViewDataItem[] => {
  return treeData
    ?.map((treeSubdata) =>
      !treeSubdata.children ? treeSubdata : getVMsFromTreeData(treeSubdata.children),
    )
    ?.flat()
    ?.filter(Boolean);
};

export const getFoldersFromTreeData = (treeData: TreeViewDataItem[]): TreeViewDataItem[] => {
  return treeData
    ?.map((treeSubdata) =>
      treeSubdata.id.startsWith(FOLDER_SELECTOR_PREFIX)
        ? treeSubdata
        : getFoldersFromTreeData(treeSubdata.children),
    )
    ?.flat()
    ?.filter(Boolean);
};

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

const dragstartHandler = (ev) => {
  ev.dataTransfer.setData('application/treeViewElementID', ev.target.id);
  ev.dataTransfer.effectAllowed = 'all';

  ev.target.style.backgroundColor = 'unset';
};

export const addDragEvent = (treeViewItem: TreeViewDataItem) => {
  const vmHTMLElement = document.getElementById(treeViewItem.id);

  if (!vmHTMLElement) return;

  vmHTMLElement.draggable = true;
  vmHTMLElement.addEventListener('dragstart', dragstartHandler);
};

export const removeDragEvent = (treeViewItem: TreeViewDataItem) => {
  const vmHTMLElement = document.getElementById(treeViewItem.id);

  if (!vmHTMLElement) return;
  vmHTMLElement.removeEventListener('dragstart', dragstartHandler);
};

export const dropEventListeners = (treeViewItem: TreeViewDataItem) => {
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

  const dragoverHandler = (ev) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';

    folderHTMLElement.style.backgroundColor =
      'var(--pf-v6-c-tree-view__node--hover--BackgroundColor)';
  };

  const dragleaveHandler = (ev) => {
    ev.preventDefault();
    folderHTMLElement.style.backgroundColor = 'unset';
  };

  folderHTMLElement.addEventListener('drop', dropHandler);
  folderHTMLElement.addEventListener('dragover', dragoverHandler);
  folderHTMLElement.addEventListener('dragleave', dragleaveHandler);

  return () => {
    folderHTMLElement.removeEventListener('drop', dropHandler);
    folderHTMLElement.removeEventListener('dragover', dragoverHandler);
    folderHTMLElement.removeEventListener('dragleave', dragleaveHandler);
  };
};

export const addListenerOnExpand = (treeViewItem: TreeViewDataItem) => {
  if (treeViewItem.id.startsWith(FOLDER_SELECTOR_PREFIX)) {
    treeViewItem.children?.forEach(addDragEvent);
  }

  if (treeViewItem.id.startsWith(PROJECT_SELECTOR_PREFIX)) {
    treeViewItem.children?.forEach((child) => {
      const isFolder = child.id.startsWith(FOLDER_SELECTOR_PREFIX);

      if (isFolder) {
        dropEventListeners(child);
        addListenerOnExpand(child);
      }

      if (!isFolder) addDragEvent(child);
    });
  }

  if (treeViewItem.id.startsWith(ALL_NAMESPACES_SESSION_KEY)) {
    treeViewItem.children?.forEach((child) => addListenerOnExpand(child));
  }
};
