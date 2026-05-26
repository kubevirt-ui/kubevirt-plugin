import React, { createContext, FC, ReactNode, useState } from 'react';

import { ResourceTypeTelemetry } from '@kubevirt-utils/extensions/telemetry/utils/types';

export type SidebarEditorContextType = {
  isEditable?: boolean;
  setEditorVisible?: (editorVisible: boolean) => void;
  showEditor: boolean;
  showSwitch: boolean;
  telemetryResourceType?: ResourceTypeTelemetry;
  telemetryStepOrField?: string;
};

export const SidebarEditorContext = createContext<SidebarEditorContextType>({
  isEditable: true,
  showEditor: false,
  showSwitch: false,
});

export type SidebarEditorProviderType = {
  children?: ReactNode;
  isEditable?: boolean;
  telemetryResourceType?: ResourceTypeTelemetry;
  telemetryStepOrField?: string;
};

export const SidebarEditorProvider: FC<SidebarEditorProviderType> = ({
  children,
  isEditable = true,
  telemetryResourceType,
  telemetryStepOrField,
}) => {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <SidebarEditorContext.Provider
      value={{
        isEditable,
        setEditorVisible: setShowEditor,
        showEditor,
        showSwitch: true,
        telemetryResourceType,
        telemetryStepOrField,
      }}
    >
      {children}
    </SidebarEditorContext.Provider>
  );
};
