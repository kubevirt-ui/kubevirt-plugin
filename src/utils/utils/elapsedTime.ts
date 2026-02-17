import { TFunction } from 'react-i18next';

export const getElapsedTimeInSeconds = (startTime: string | undefined): number => {
  if (!startTime) return 0;

  const parsedTime = Date.parse(startTime);
  if (isNaN(parsedTime)) return 0;

  const difference = Date.now() - parsedTime;
  return difference <= 0 ? 0 : Math.floor(difference / 1000);
};

export const formatElapsedTime = (t: TFunction, seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return t('{{hours}}h {{minutes}}m {{seconds}}s', { hours, minutes, seconds: secs });
  }
  if (minutes > 0) {
    return t('{{minutes}}m {{seconds}}s', { minutes, seconds: secs });
  }
  return t('{{seconds}}s', { seconds: secs });
};
