import type { FC, ReactNode } from 'react';
import { createContext } from 'react';

export const VMEditPermissionContext = createContext<boolean>(true);

type VMEditPermissionProviderProps = {
  children: ReactNode;
  isEditable: boolean;
};

export const VMEditPermissionProvider: FC<VMEditPermissionProviderProps> = ({
  children,
  isEditable,
}) => {
  return (
    <VMEditPermissionContext.Provider value={isEditable}>
      {children}
    </VMEditPermissionContext.Provider>
  );
};
