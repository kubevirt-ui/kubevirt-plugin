import type { ComponentType } from 'react';

const sceneStoryModules = import.meta.glob('../scenes/**/*.scene.{tsx,jsx}');

export const storyPathFromFile = (file: string): string =>
  file.replace(/^(\.\.\/)+scenes\//, 'scenes/').replace(/\.scene\.(tsx|jsx)$/, '');

const isStoryExport = (value: unknown): value is ComponentType<Record<string, unknown>> =>
  typeof value === 'function';

export async function listStoryIds(): Promise<string[]> {
  const ids: string[] = [];

  for (const file of Object.keys(sceneStoryModules)) {
    const path = storyPathFromFile(file);
    const mod = (await sceneStoryModules[file]()) as Record<string, unknown>;

    const namedExports = Object.keys(mod).filter(
      (key) => key !== 'default' && key !== 'meta' && isStoryExport(mod[key]),
    );

    if (namedExports.length > 0) {
      for (const name of namedExports) {
        ids.push(`${path}/${name}`);
      }
    } else if (isStoryExport(mod.default)) {
      ids.push(path);
    }
  }

  return ids.sort();
}

export async function resolveStory(
  storyId: string,
): Promise<ComponentType<Record<string, unknown>> | null> {
  const sep = storyId.lastIndexOf('/');
  const storyPath = storyId.slice(0, sep);
  const exportName = storyId.slice(sep + 1);

  const file = Object.keys(sceneStoryModules).find((candidate) => {
    const path = storyPathFromFile(candidate);
    return path === storyPath || path.endsWith(`/${storyPath}`);
  });

  if (!file) {
    return null;
  }

  const mod = (await sceneStoryModules[file]()) as Record<string, unknown>;
  const component = mod[exportName] ?? mod.default;
  return isStoryExport(component) ? component : null;
}
