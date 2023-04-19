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
  devices: BootableDeviceType[];
  onChange: (disks: BootableDeviceType[]) => void;
  isEditMode: boolean;
  changeEditMode: (isEditMode: boolean) => void;
}> = ({ devices, isEditMode, onChange, changeEditMode }) => {
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
          title={t('No resource selected')}
          message={t(
            'VirtualMachine will attempt to boot from disks by order of apearance in YAML file',
          )}
          addItemMessage={t('Add source')}
          addItemDisabledMessage={t('All sources selected')}
          addItemIsDisabled={devices.length === 0}
          onClick={() => {
            changeEditMode(true);
          }}
        />
      ) : (
        <>
          <DragDrop onDrop={onDrop}>
            <Droppable hasNoWrapper>
              <DataList aria-label="draggable data list example">
                {devices.map(({ type, value }, index) => (
                  <Draggable key={value.name} hasNoWrapper>
                    <DataListItem aria-labelledby={value.name} ref={React.createRef()}>
                      <DataListItemRow>
                        <DataListControl>
                          <DataListDragButton
                            aria-label="Reorder"
                            aria-labelledby={value.name}
                            aria-describedby="Press space or enter to begin dragging, and use the arrow keys to navigate up or down. Press enter to confirm the drag, or any other key to cancel the drag operation."
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
                                      id={`${value.name}-delete-btn`}
                                      onClick={() => onDelete(value.name)}
                                      variant="link"
                                      className="kubevirt-boot-order__delete-btn"
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
