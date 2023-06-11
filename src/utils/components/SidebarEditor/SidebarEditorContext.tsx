import React, { createContext, FC, useState } from 'react';

export type SidebarEditorContextType = {
  isEditable?: boolean;
  setEditorVisible?: (editorVisible: boolean) => void;
  showEditor: boolean;
  showSwitch: boolean;
};

export const SidebarEditorContext = createContext<SidebarEditorContextType>({
  isEditable: true,
  showEditor: false,
  showSwitch: false,
});

export type SidebarEditorProviderType = {
  isEditable?: boolean;
};

export const SidebarEditorProvider: FC<SidebarEditorProviderType> = ({
  children,
  isEditable = true,
}) => {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <SidebarEditorContext.Provider
      value={{ isEditable, setEditorVisible: setShowEditor, showEditor, showSwitch: true }}
    >
      {children}
    </SidebarEditorContext.Provider>
  );
};
