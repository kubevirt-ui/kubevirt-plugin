import React, { createContext, FC, useState } from 'react';

export type SidebarEditorContextType = {
  showEditor: boolean;
  setEditorVisible?: (editorVisible: boolean) => void;
  showSwitch: boolean;
};

export const SidebarEditorContext = createContext<SidebarEditorContextType>({
  showEditor: false,
  showSwitch: false,
});

export const SidebarEditorProvider: FC = ({ children }) => {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <SidebarEditorContext.Provider
      value={{ showEditor, setEditorVisible: setShowEditor, showSwitch: true }}
    >
      {children}
    </SidebarEditorContext.Provider>
  );
};
