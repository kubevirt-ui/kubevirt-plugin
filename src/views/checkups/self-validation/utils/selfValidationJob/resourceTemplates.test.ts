import { JOB_ENV_ACCEPT_WINDOWS_EULA, JOB_ENV_WIN_IMAGE_DOWNLOAD_URL } from '../constants';

import { selfValidationJob } from './resourceTemplates';

describe('selfValidationJob Windows env', () => {
  const baseOptions = {
    acceptWindowsEula: true,
    checkupImage: 'test-image',
    isDryRun: false,
    name: 'checkup',
    namespace: 'default',
    selectedTestSuites: ['tier2'],
  };

  it('should omit WIN_IMAGE_DOWNLOAD_URL when the URL is empty', () => {
    const job = selfValidationJob({ ...baseOptions, winImageDownloadUrl: '' });
    const env = job.spec?.template?.spec?.containers?.[0]?.env || [];

    expect(env.some((entry) => entry.name === JOB_ENV_ACCEPT_WINDOWS_EULA)).toBe(true);
    expect(env.some((entry) => entry.name === JOB_ENV_WIN_IMAGE_DOWNLOAD_URL)).toBe(false);
  });

  it('should include WIN_IMAGE_DOWNLOAD_URL when a URL is provided', () => {
    const url = 'https://example.com/windows.iso';
    const job = selfValidationJob({ ...baseOptions, winImageDownloadUrl: url });
    const env = job.spec?.template?.spec?.containers?.[0]?.env || [];
    const downloadEnv = env.find((entry) => entry.name === JOB_ENV_WIN_IMAGE_DOWNLOAD_URL);

    expect(downloadEnv?.value).toBe(url);
  });

  it('should never include WIN_IMAGE_NAME', () => {
    const job = selfValidationJob({
      ...baseOptions,
      winImageDownloadUrl: 'https://example.com/windows.iso',
    });
    const env = job.spec?.template?.spec?.containers?.[0]?.env || [];

    expect(env.some((entry) => entry.name === 'WIN_IMAGE_NAME')).toBe(false);
  });
});
