import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, DropdownItem, MenuItemAction, Tooltip } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';

type SavedSearchItemProps = {
  description?: string;
  isFavorited: boolean;
  name: string;
  onApply: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
};

const SavedSearchItem: FC<SavedSearchItemProps> = ({
  description,
  isFavorited,
  name,
  onApply,
  onDelete,
  onToggleFavorite,
}) => {
  const { t } = useKubevirtTranslation();

  const item = (
    <DropdownItem
      actions={
        <MenuItemAction
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={t('Delete saved search')}
          data-test={`delete-search-item-${name}`}
          icon={<TrashIcon />}
        />
      }
      icon={
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={isFavorited ? t('Remove from favorites') : t('Add to favorites')}
          data-test={`toggle-favorite-${name}`}
          isFavorite
          isFavorited={isFavorited}
          variant="plain"
        />
      }
      className="pf-v6-u-py-0"
      data-test={`saved-search-item-${name}`}
      onClick={onApply}
    >
      {name}
    </DropdownItem>
  );

  if (!description) return item;

  return (
    <Tooltip content={description} entryDelay={800}>
      {item}
    </Tooltip>
  );
};

export default SavedSearchItem;
