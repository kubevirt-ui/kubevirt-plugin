import { type MouseEvent, useCallback } from 'react';

type UseDropdownMenuSelectParams = {
  onChange: (item: string) => void;
  setIsOpen: (open: boolean) => void;
};

export const useDropdownMenuSelect = ({
  onChange,
  setIsOpen,
}: UseDropdownMenuSelectParams): {
  onSelect: (event: MouseEvent, itemId: string) => void;
} => {
  const onSelect = useCallback(
    (_event: MouseEvent, itemId: string) => {
      setIsOpen(false);
      onChange(itemId);
    },
    [onChange, setIsOpen],
  );

  return { onSelect };
};
