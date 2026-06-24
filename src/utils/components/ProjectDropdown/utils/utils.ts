import { MouseEvent } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { ConsoleBookmarks } from '@kubevirt-utils/hooks/consoleUserSettings/types';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type UpdateBookmarks = (bookmarks: ConsoleBookmarks) => Promise<ConsoleBookmarks>;

export type GetProjectOptionsParams = {
  bookmarks?: ConsoleBookmarks;
  includeAllProjects: boolean;
  projects: K8sResourceCommon[];
  showSystemNamespaces?: boolean;
  updateBookmarks?: UpdateBookmarks;
};

export const getProjectOptions = ({
  bookmarks = {},
  includeAllProjects,
  projects,
  showSystemNamespaces = true,
  updateBookmarks,
}: GetProjectOptionsParams): EnhancedSelectOptionProps[] => {
  const favoriteOptions: EnhancedSelectOptionProps[] = [];
  const regularOptions: EnhancedSelectOptionProps[] = [];

  projects.forEach((proj) => {
    const name = getName(proj);
    if (!name) return;

    const isFavorite = Boolean(bookmarks[name]);
    const isSystemProject = isSystemNamespace(name);

    if (!showSystemNamespaces && isSystemProject && !isFavorite) {
      return;
    }

    const option: EnhancedSelectOptionProps = {
      children: name,
      group: isFavorite ? 'Favorites' : undefined,
      groupVersionKind: modelToGroupVersionKind(ProjectModel),
      isFavorite,
      name,
      onFavorite:
        updateBookmarks &&
        ((e: MouseEvent) => {
          e.stopPropagation();
          const newBookmarks = {
            ...bookmarks,
            [name]: !isFavorite,
          };
          // Remove from bookmarks if unfavoriting
          if (isFavorite) {
            delete newBookmarks[name];
          }
          updateBookmarks(newBookmarks);
        }),
      value: name,
    };

    if (isFavorite) {
      favoriteOptions.push(option);
    } else {
      regularOptions.push(option);
    }
  });

  // Sort each group alphabetically
  favoriteOptions.sort((a, b) => a.value.localeCompare(b.value));
  regularOptions.sort((a, b) => a.value.localeCompare(b.value));

  const allProjects = includeAllProjects
    ? [
        {
          children: ALL_PROJECTS,
          groupVersionKind: modelToGroupVersionKind(ProjectModel),
          value: ALL_PROJECTS,
        },
      ]
    : [];

  // Return favorites first (if any), then regular projects
  return [...allProjects, ...favoriteOptions, ...regularOptions];
};
