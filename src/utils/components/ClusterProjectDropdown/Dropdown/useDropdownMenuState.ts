import { useCallback, useState } from 'react';

export const useDropdownMenuState = (): {
  closeMenu: () => void;
  filterText: string;
  isOpen: boolean;
  setFilterText: (text: string) => void;
  setIsOpen: (open: boolean) => void;
} => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setFilterText('');
  }, []);

  return { closeMenu, filterText, isOpen, setFilterText, setIsOpen };
};
