import { Dispatch, SetStateAction, useCallback, useState } from 'react';

import { IDEntity } from '../utils/types';

type UseIDEntitiesProps = <T extends IDEntity = IDEntity>(
  initialEntities: T[],
) => {
  entities: T[];
  initialEntitiesChanged: boolean;
  onEntityAdd: (newEntity: T) => void;
  onEntityChange: (updatedEntity: T) => void;
  onEntityDelete: (idToDelete: number) => void;
  setEntities: Dispatch<SetStateAction<T[]>>;
};

export const useIDEntities: UseIDEntitiesProps = <T extends IDEntity = IDEntity>(
  initialEntities = [],
) => {
  const [entities, setEntities] = useState<T[]>(initialEntities);
  const [initialEntitiesChanged, setInitialEntitiesChanged] = useState<boolean>(false);

  const onEntityAdd = useCallback(
    (newEntity: T) => {
      setInitialEntitiesChanged(true);
      const id = entities[entities.length - 1]?.id + 1 || 0;
      setEntities([...entities, { ...newEntity, id }]);
    },
    [entities],
  );

  const onEntityChange = useCallback(
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

  const onEntityDelete = useCallback(
    (idToDelete: number) => {
      setInitialEntitiesChanged(true);
      setEntities(entities.filter(({ id }) => id !== idToDelete));
    },
    [entities],
  );

  return {
    entities,
    initialEntitiesChanged,
    onEntityAdd,
    onEntityChange,
    onEntityDelete,
    setEntities,
  };
};
