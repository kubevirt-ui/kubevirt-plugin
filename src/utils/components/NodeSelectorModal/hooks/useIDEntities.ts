import * as React from 'react';

import { IDEntity } from '../utils/types';

type UseIDEntitiesProps = <T extends IDEntity = IDEntity>(
  initialEntities: T[],
) => {
  entities: T[];
  setEntities: React.Dispatch<React.SetStateAction<T[]>>;
  onEntityAdd: (newEntity: T) => void;
  onEntityChange: (updatedEntity: T) => void;
  onEntityDelete: (idToDelete: number) => void;
  initialEntitiesChanged: boolean;
};

export const useIDEntities: UseIDEntitiesProps = <T extends IDEntity = IDEntity>(
  initialEntities = [],
) => {
  const [entities, setEntities] = React.useState<T[]>(initialEntities);
  const [initialEntitiesChanged, setInitialEntitiesChanged] = React.useState<boolean>(false);

  const onEntityAdd = React.useCallback(
    (newEntity: T) => {
      setInitialEntitiesChanged(true);
      const id = entities[entities.length - 1]?.id + 1 || 0;
      setEntities([...entities, { ...newEntity, id }]);
    },
    [entities],
  );

  const onEntityChange = React.useCallback(
    (updatedEntity: T) => {
      setInitialEntitiesChanged(true);
      setEntities(
        entities.map((entity) => {
          if (entity.id === updatedEntity.id) {
            return updatedEntity;
          }
          return entity;
        }),
      );
    },
    [entities],
  );

  const onEntityDelete = React.useCallback(
    (idToDelete: number) => {
      setInitialEntitiesChanged(true);
      setEntities(entities.filter(({ id }) => id !== idToDelete));
    },
    [entities],
  );

  return {
    entities,
    setEntities,
    onEntityAdd,
    onEntityChange,
    onEntityDelete,
    initialEntitiesChanged,
  };
};
