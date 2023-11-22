import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  BootableDeviceType,
  DeviceType,
} from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';
import {
  Button,
  DataList,
  DataListCell,
  DataListControl,
  DataListDragButton,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DragDrop,
  Draggable,
  Droppable,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { BootOrderEmptyState } from './BootOrderEmptyState';
import DeviceTypeIcon from './DeviceTypeIcon';

export const BootOrderModalBody: React.FC<{
  changeEditMode: (isEditMode: boolean) => void;
  devices: BootableDeviceType[];
  isEditMode: boolean;
  onChange: (disks: BootableDeviceType[]) => void;
}> = ({ changeEditMode, devices, isEditMode, onChange }) => {
  const { t } = useKubevirtTranslation();

  const reorder = (
    list: BootableDeviceType[],
    startIndex: number,
    endIndex: number,
  ): BootableDeviceType[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDrop = (source, dest) => {
    if (dest) {
      const newBootableDevices = reorder(devices, source.index, dest.index).map(
        (device, index) => ({
          ...device,
          value: { ...device.value, bootOrder: index + 1 },
        }),
      );
      onChange(newBootableDevices);

      return true; // Signal that this is a valid drop and not to animate the item returning home.
    }
  };

  // Remove a bootOrder from a device by index.
  const onDelete = (name: string) => {
    const deviceToUpdate = devices.find((d) => d.value.name === name);

    const newDevices = [
      ...devices.filter((device) => device.value.name !== name),
      { ...deviceToUpdate, value: { ...deviceToUpdate.value, bootOrder: undefined } },
    ];

    onChange(newDevices);
  };

  const showEmpty = devices.length === 0 && !isEditMode;

  return (
    <>
      {showEmpty ? (
        <BootOrderEmptyState
          message={t(
            'VirtualMachine will attempt to boot from disks by order of apearance in YAML file',
          )}
          onClick={() => {
            changeEditMode(true);
          }}
          addItemDisabledMessage={t('All sources selected')}
          addItemIsDisabled={devices.length === 0}
          addItemMessage={t('Add source')}
          title={t('No resource selected')}
        />
      ) : (
        <>
          <DragDrop onDrop={onDrop}>
            <Droppable hasNoWrapper>
              <DataList aria-label="draggable data list example">
                {devices.map(({ type, value }, index) => (
                  <Draggable hasNoWrapper key={value.name}>
                    <DataListItem aria-labelledby={value.name} ref={React.createRef()}>
                      <DataListItemRow>
                        <DataListControl>
                          <DataListDragButton
                            aria-describedby="Press space or enter to begin dragging, and use the arrow keys to navigate up or down. Press enter to confirm the drag, or any other key to cancel the drag operation."
                            aria-label="Reorder"
                            aria-labelledby={value.name}
                            aria-pressed="false"
                          />
                        </DataListControl>
                        <DataListItemCells
                          dataListCells={[
                            <DataListCell key={value.name}>
                              <Split>
                                <SplitItem isFilled>
                                  <span id={value.name}>{value.name}</span>

                                  <span className="pf-u-ml-sm">
                                    <DeviceTypeIcon type={type as DeviceType} />
                                  </span>
                                </SplitItem>
                                <SplitItem>
                                  {index !== devices.length - 1 && (
                                    <Button
                                      className="kubevirt-boot-order__delete-btn"
                                      id={`${value.name}-delete-btn`}
                                      onClick={() => onDelete(value.name)}
                                      variant="link"
                                    >
                                      <MinusCircleIcon />
                                    </Button>
                                  )}
                                </SplitItem>
                              </Split>
                            </DataListCell>,
                          ]}
                        />
                      </DataListItemRow>
                    </DataListItem>
                  </Draggable>
                ))}
              </DataList>
            </Droppable>
          </DragDrop>
        </>
      )}
    </>
  );
};
