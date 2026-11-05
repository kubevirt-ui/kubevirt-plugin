import { createContext, useContext } from 'react';

export const OpenLinksInNewTabContext = createContext<boolean>(false);

export const useOpenLinksInNewTab = (): boolean => useContext(OpenLinksInNewTabContext);
