import React, { Dispatch, MouseEvent, Ref, SetStateAction, useState } from 'react';

import { isKeyboardLayout, KeyboardLayout, KeyMapDef, keyMaps } from '@kubevirt-ui/vnc-keymaps';
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

import { AccessConsolesActions, EN_US } from './utils/accessConsoles';

export const VncKeymapDropdown = ({
  actions,
  favoriteKeymaps,
  selectedKeyboard,
  setSelectedKeyboard,
  updateFavorite,
}: {
  actions: AccessConsolesActions;
  favoriteKeymaps: KeyboardLayout[];
  selectedKeyboard: KeyboardLayout;
  setSelectedKeyboard: Dispatch<SetStateAction<KeyboardLayout>>;
  updateFavorite: (keymap: KeyboardLayout) => void;
}) => {
  const { t } = useKubevirtTranslation();
  const [isKeyboardSelectOpen, setIsKeyboardSelectOpen] = useState<boolean>(false);
  const { createModal } = useModal();
  const typeInLabel = t('Paste to console');

  return (
    <Dropdown
      onActionClick={(event, value) => {
        event.stopPropagation();
        updateFavorite(value);
      }}
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
      <DropdownList>
        {favoriteKeymaps.length > 0 && (
          <>
            <DropdownGroup>
              {favoriteKeymaps
                .map((value): [KeyboardLayout, KeyMapDef] => [value, keyMaps[value]])
                .map(([value, def]) => (
                  <DropdownItem description={value} isFavorited key={value} value={value}>
                    {def.description}
                  </DropdownItem>
                ))}
            </DropdownGroup>
            <Divider component="li" />
          </>
        )}
        <DropdownGroup>
          <DropdownItem
            description={EN_US}
            isFavorited={favoriteKeymaps.includes(EN_US)}
            value={EN_US}
          >
            {keyMaps[EN_US].description}
          </DropdownItem>
        </DropdownGroup>
        <Divider component="li" />
        <DropdownGroup>
          {Object.entries(keyMaps)
            .filter(([value]) => value !== EN_US)
            .sort(([, a], [, b]) => a.description.localeCompare(b.description))
            .map(([value, def]) => (
              <DropdownItem
                description={value}
                isFavorited={favoriteKeymaps.includes(value as KeyboardLayout)}
                key={value}
                value={value}
              >
                {def.description}
              </DropdownItem>
            ))}
        </DropdownGroup>
      </DropdownList>
    </Dropdown>
  );
};
