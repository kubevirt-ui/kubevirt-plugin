import React from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type ConsoleNamespaceBookmarks = Record<string, boolean>;
type UpdateBookmarks = (bookmarks: ConsoleNamespaceBookmarks) => Promise<ConsoleNamespaceBookmarks>;

export const getProjectOptions = (
  includeAllProjects: boolean,
  projects: K8sResourceCommon[],
  bookmarks: ConsoleNamespaceBookmarks = {},
  updateBookmarks?: UpdateBookmarks,
): EnhancedSelectOptionProps[] => {
  const favoriteOptions: EnhancedSelectOptionProps[] = [];
  const regularOptions: EnhancedSelectOptionProps[] = [];

  projects.forEach((proj) => {
    const name = getName(proj);
    const isFavorite = Boolean(bookmarks[name]);
    const option: EnhancedSelectOptionProps = {
      children: name,
      group: isFavorite ? 'Favorites' : undefined,
      groupVersionKind: modelToGroupVersionKind(ProjectModel),
      isFavorite,
      name,
      onFavorite:
        updateBookmarks &&
        ((e: React.MouseEvent) => {
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
