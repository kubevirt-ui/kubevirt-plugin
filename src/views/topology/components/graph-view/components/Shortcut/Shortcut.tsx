import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { upperFirst } from '@kubevirt-utils/utils/utils';
import { MouseIcon } from '@patternfly/react-icons';

import ShortcutCommand from './components/ShortcutCommand';

interface ShortcutProps {
  children: ReactNode;
  alt?: boolean;
  click?: boolean;
  ctrl?: boolean;
  ctrlCmd?: boolean;
  drag?: boolean;
  hover?: boolean;
  keyName?: string;
  rightClick?: boolean;
  shift?: boolean;
  dragNdrop?: boolean;
}

export const isMac = window.navigator.platform.includes('Mac');

const Shortcut: FC<ShortcutProps> = ({
  children,
  alt,
  click,
  ctrl,
  ctrlCmd,
  drag,
  hover,
  keyName,
  rightClick,
  shift,
  dragNdrop,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <tr>
      <td className="ocs-shortcut__cell">
        {(ctrl || (!isMac && ctrlCmd)) && (
          <ShortcutCommand data-test-id="ctrl-button">Ctrl</ShortcutCommand>
        )}
        {alt && (
          <ShortcutCommand data-test-id={isMac ? 'opt-button' : 'alt-button'}>
            {isMac ? '⌥ Opt' : 'Alt'}
          </ShortcutCommand>
        )}
        {shift && <ShortcutCommand data-test-id="shift-button">Shift</ShortcutCommand>}
        {isMac && ctrlCmd && <ShortcutCommand data-test-id="cmd-button">⌘ Cmd</ShortcutCommand>}
        {hover && (
          <ShortcutCommand data-test-id="hover">
            <MouseIcon /> {t('Hover')}
          </ShortcutCommand>
        )}
        {keyName && (
          <ShortcutCommand data-test-id={`${keyName}-button`}>
            {keyName.length === 1 ? keyName.toUpperCase() : upperFirst(keyName.toLowerCase())}
          </ShortcutCommand>
        )}
        {drag && (
          <ShortcutCommand data-test-id="drag">
            <MouseIcon /> {t('Drag')}
          </ShortcutCommand>
        )}
        {click && (
          <ShortcutCommand data-test-id="click">
            <MouseIcon /> {t('Click')}
          </ShortcutCommand>
        )}
        {rightClick && (
          <ShortcutCommand data-test-id="right-click">
            <MouseIcon /> {t('Right click')}
          </ShortcutCommand>
        )}
        {dragNdrop && (
          <ShortcutCommand data-test-id="drag-and-drop">
            <MouseIcon /> {t('Drag + Drop')}
          </ShortcutCommand>
        )}
      </td>
      <td className="ocs-shortcut__cell">{children}</td>
    </tr>
  );
};

export default Shortcut;
