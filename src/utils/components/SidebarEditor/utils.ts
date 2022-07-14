import { load } from 'js-yaml';

export const safeLoad = <Resource>(value: string): Resource | undefined => {
  try {
    return load(value) as Resource;
  } catch (error) {
    console.error(error);
    return;
  }
};
