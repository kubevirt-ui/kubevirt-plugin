import { ensurePath } from '@kubevirt-utils/utils/utils';

type MutableObject = Record<string, unknown>;
type PathNode = MutableObject | unknown[];

export const isMutableObject = (value: unknown): value is MutableObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPathNode = (value: unknown): value is PathNode =>
  typeof value === 'object' && value !== null;

const getPathChild = (node: PathNode, segment: string): unknown => {
  if (Array.isArray(node)) {
    return node[Number(segment)];
  }
  return node[segment];
};

const setPathChild = (node: PathNode, segment: string, value: unknown): void => {
  if (Array.isArray(node)) {
    node[Number(segment)] = value;
    return;
  }
  node[segment] = value;
};

const ensurePathParts = (obj: MutableObject, pathParts: string[]): void => {
  let current: PathNode = obj;
  for (const part of pathParts.slice(0, -1)) {
    const existing = getPathChild(current, part);
    if (existing == null || !isPathNode(existing)) {
      const created: MutableObject = {};
      setPathChild(current, part, created);
      current = created;
      continue;
    }
    current = existing;
  }
};

export const parsePath = (path: string | string[]): string[] =>
  (typeof path === 'string' ? path.split('.') : path).filter(Boolean);

export const ensureNestedStructure = (
  draft: object,
  path: string | string[],
  pathParts: string[],
): void => {
  if (!isMutableObject(draft)) {
    return;
  }

  if (typeof path === 'string') {
    ensurePath(draft, pathParts.join('.'));
    return;
  }

  ensurePathParts(draft, pathParts);
};

export const setValueAtPath = (
  draft: object,
  pathParts: string[],
  data: unknown,
  merge: boolean,
  mergeValues: (currentData: unknown, updateData: unknown) => unknown,
): void => {
  if (!isMutableObject(draft)) {
    return;
  }

  const targetKey = pathParts.at(-1);
  if (targetKey === undefined) {
    return;
  }

  let parentNode: PathNode = draft;
  for (const segment of pathParts.slice(0, -1)) {
    const child = getPathChild(parentNode, segment);
    if (!isPathNode(child)) {
      return;
    }
    parentNode = child;
  }

  const nextValue = merge ? mergeValues(getPathChild(parentNode, targetKey), data) : data;
  setPathChild(parentNode, targetKey, nextValue);
};
