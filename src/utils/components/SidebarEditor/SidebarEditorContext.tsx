import React, { createContext, FC, useState } from 'react';

export type SidebarEditorContextType = {
  showEditor: boolean;
  setEditorVisible?: (editorVisible: boolean) => void;
  showSwitch: boolean;
  isEditable?: boolean;
};

export const SidebarEditorContext = createContext<SidebarEditorContextType>({
  showEditor: false,
  showSwitch: false,
  isEditable: true,
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
      value={{ showEditor, setEditorVisible: setShowEditor, showSwitch: true, isEditable }}
    >
      {children}
    </SidebarEditorContext.Provider>
  );
};
