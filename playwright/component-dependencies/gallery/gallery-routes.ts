/** URL paths for the component gallery (dev server + deep links). */

export const GALLERY_BASE_PATH = '/playwright/gallery';

/** Prefix for a mounted story: `/playwright/gallery/story/<storyId>`. */
export const GALLERY_STORY_PATH_PREFIX = `${GALLERY_BASE_PATH}/story/`;

export const galleryIndexPath = (): string => `${GALLERY_BASE_PATH}/`;

export const storyRoutePath = (storyId: string): string =>
  `${GALLERY_STORY_PATH_PREFIX}${storyId.split('/').map(encodeURIComponent).join('/')}`;

export const storyIdFromPathname = (pathname: string): string | null => {
  if (!pathname.startsWith(GALLERY_STORY_PATH_PREFIX)) {
    return null;
  }
  const encoded = pathname.slice(GALLERY_STORY_PATH_PREFIX.length);
  if (!encoded) {
    return null;
  }
  try {
    return encoded
      .split('/')
      .map((segment) => decodeURIComponent(segment))
      .join('/');
  } catch {
    return null;
  }
};

export const isGalleryIndexPath = (pathname: string): boolean => {
  if (pathname === GALLERY_BASE_PATH || pathname === `${GALLERY_BASE_PATH}/`) {
    return true;
  }
  return pathname === `${GALLERY_BASE_PATH}/index.html`;
};
