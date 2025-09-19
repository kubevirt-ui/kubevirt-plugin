import React, { MouseEvent, Ref, useState } from 'react';

import { isKeyboardLayout, KeyboardLayout, keyMaps } from '@kubevirt-ui/vnc-keymaps';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleAction,
  MenuToggleElement,
} from '@patternfly/react-core';
import { PasteIcon } from '@patternfly/react-icons';

import { AccessConsolesActions } from './utils/accessConsoles';

export const VncKeymapDropdown = ({ actions }: { actions: AccessConsolesActions }) => {
  const { t } = useKubevirtTranslation();
  const defaultKeyboard: KeyboardLayout = 'en-us';
  const [selectedKeyboard, setSelectedKeyboard] = useState<KeyboardLayout>(defaultKeyboard);
  const [isKeyboardSelectOpen, setIsKeyboardSelectOpen] = useState<boolean>(false);
  const { createModal } = useModal();
  const typeInLabel = t('Paste to console');

  return (
    <Dropdown
      onSelect={(_event, value?: number | string) => {
        isKeyboardLayout(value) && setSelectedKeyboard(value);
        setIsKeyboardSelectOpen(false);
      }}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          splitButtonItems={[
            <MenuToggleAction
              onClick={
                actions.sendPaste
                  ? (e: MouseEvent<HTMLButtonElement>) => {
                      e?.currentTarget?.blur();
                      actions
                        .sendPaste({
                          createModal,
                          selectedKeyboard,
                          shouldFocusOnConsole: true,
                        })
                        // eslint-disable-next-line no-console
                        .catch((err) => console.error('Failed to paste into VNC console', err));
                    }
                  : undefined
              }
              aria-label={typeInLabel}
              key={typeInLabel}
            >
              <PasteIcon />
              {typeInLabel}
            </MenuToggleAction>,
          ]}
          className="vnc-paste-button"
          isExpanded={isKeyboardSelectOpen}
          onClick={() => setIsKeyboardSelectOpen(!isKeyboardSelectOpen)}
          ref={toggleRef}
          variant="secondary"
        >
          {selectedKeyboard}
        </MenuToggle>
      )}
      isOpen={isKeyboardSelectOpen}
      isScrollable
      onOpenChange={(isOpen) => setIsKeyboardSelectOpen(isOpen)}
      selected={selectedKeyboard}
      shouldFocusToggleOnSelect
    >
      <DropdownGroup>
        <DropdownItem description={defaultKeyboard} value={defaultKeyboard}>
          {keyMaps[defaultKeyboard].description}
        </DropdownItem>
      </DropdownGroup>
      <Divider component="li" />
      <DropdownList>
        {Object.entries(keyMaps)
          .filter(([value]) => value !== defaultKeyboard)
          .sort(([, a], [, b]) => a.description.localeCompare(b.description))
          .map(([value, def]) => (
            <DropdownItem description={value} key={value} value={value}>
              {def.description}
            </DropdownItem>
          ))}
      </DropdownList>
    </Dropdown>
  );
};
