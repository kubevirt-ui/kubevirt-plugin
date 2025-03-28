import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getLabels, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import {
  DRAG_N_DROP_LISTENERS,
  DROP_EFFECTS,
  NOT_ALLOWED_DRAG_TARGET_BACKGROUND_COLOR,
  REMOVE_DRAG_BACKGROUND_COLOR,
  VALID_DRAG_TARGET_BACKGROUND_COLOR,
} from './constants';
import { getVMFromElementID } from './utils';

let draggingVM: null | V1VirtualMachine = null;

export const changeVMFolder = (newFolder: string) =>
  k8sPatch({
    data: [
      ...(isEmpty(getLabels(draggingVM))
        ? [
            {
              op: 'add',
              path: `/metadata/labels`,
              value: {},
            },
          ]
        : []),
      {
        op: 'replace',
        path: `/metadata/labels/${VM_FOLDER_LABEL?.replace('/', '~1')}`,
        value: newFolder,
      },
    ],
    model: VirtualMachineModel,
    resource: draggingVM,
  });

const dragStartHandler = (event) => {
  const elementId = event.target.id as string;
  event.dataTransfer.effectAllowed = 'all';

  event.target.style.backgroundColor = REMOVE_DRAG_BACKGROUND_COLOR;

  draggingVM = getVMFromElementID(elementId);
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

    changeVMFolder(folderName);

    dropHTMLElement.style.backgroundColor = REMOVE_DRAG_BACKGROUND_COLOR;
  };

  const dragOverHandler = (event) => {
    const dragAllowed = getNamespace(draggingVM) === dropNamespace;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = dragAllowed ? DROP_EFFECTS.MOVE : DROP_EFFECTS.NONE;

    dropHTMLElement.style.backgroundColor = dragAllowed
      ? VALID_DRAG_TARGET_BACKGROUND_COLOR
      : NOT_ALLOWED_DRAG_TARGET_BACKGROUND_COLOR;
  };

  const dragLeaveHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropHTMLElement.style.backgroundColor = REMOVE_DRAG_BACKGROUND_COLOR;
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
