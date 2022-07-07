import {
  DAY,
  HOUR,
  JUST_NOW,
  MAX_CLOCK_SKEW_MS,
  MINTUE,
  MINUTE_IN_MS,
  TEN_AND_HALF_MINUTES_IN_MS,
} from './constants';

const dateTimeFormatterOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  year: 'numeric',
};
const utcDateTimeFormatterOptions: Intl.DateTimeFormatOptions = {
  ...dateTimeFormatterOptions,
  timeZone: 'UTC',
  timeZoneName: 'short',
};
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, dateTimeFormatterOptions);

export const utcDateTimeFormatter = new Intl.DateTimeFormat(undefined, utcDateTimeFormatterOptions);

const relativeTimeFormatter = Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat() : null;

const getDuration = (ms: number) => {
  let miliseconds = ms;
  if (!ms || ms < 0) {
    miliseconds = 0;
  }
  const seconds = Math.floor(miliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return { days, hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60 };
};

export const isValid = (dateTime: Date): boolean =>
  dateTime instanceof Date && !isNaN(dateTime.valueOf());

export const fromNow = (dateTime: string | Date, now?: Date, options?) => {
  // Check for null. If dateTime is null, it returns incorrect date Jan 1 1970.
  if (!dateTime) {
    return '-';
  }

  if (!now) {
    now = new Date();
  }

  const date = new Date(dateTime);
  const ms = now.getTime() - date.getTime();

  // If the event occurred less than one minute in the future, assume it's clock drift and show "Just now."
  if (!options?.omitSuffix && ms < MINUTE_IN_MS && ms > MAX_CLOCK_SKEW_MS) {
    return JUST_NOW;
  }

  // Do not attempt to handle other dates in the future.
  if (ms < 0) {
    return '-';
  }

  const { days, hours, minutes } = getDuration(ms);

  if (options?.omitSuffix) {
    if (days) {
      return { value: days, time: DAY };
    }
    if (hours) {
      return { value: hours, time: HOUR };
    }
    return { value: minutes, time: MINTUE };
  }

  // Fallback to normal date/time formatting if Intl.RelativeTimeFormat is not
  // available. This is the case for older Safari versions.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat#browser_compatibility
  if (!relativeTimeFormatter) {
    return dateTimeFormatter.format(date);
  }

  if (!days && !hours && !minutes) {
    return JUST_NOW;
  }

  if (days) {
    return relativeTimeFormatter.format(-days, DAY);
  }

  if (hours) {
    return relativeTimeFormatter.format(-hours, HOUR);
  }

  return relativeTimeFormatter.format(-minutes, MINTUE);
};

export const timestampFor = (mdate: Date, now: Date, omitSuffix: boolean) => {
  if (!isValid(mdate)) {
    return '-';
  }

  const timeDifference = now.getTime() - mdate.getTime();
  if (omitSuffix) {
    return fromNow(mdate, undefined, { omitSuffix: true });
  }

  // Show a relative time if within 10.5 minutes in the past from the current time.
  if (timeDifference > MAX_CLOCK_SKEW_MS && timeDifference < TEN_AND_HALF_MINUTES_IN_MS) {
    return fromNow(mdate);
  }

  // Apr 23, 2021, 4:33 PM
  return dateTimeFormatter.format(mdate);
};
