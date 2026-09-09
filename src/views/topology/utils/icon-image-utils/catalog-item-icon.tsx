import { logos } from './catalogItemIcons';

export const getImageForIconClass = (iconClass: string): string => logos.get(iconClass) ?? '';
