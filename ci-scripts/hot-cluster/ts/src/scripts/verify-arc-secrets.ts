/**
 * Verify that ARC authentication secrets are present.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Env: ARC_GITHUB_APP_ID, ARC_GITHUB_APP_INSTALL_ID, ARC_GITHUB_APP_PRIVATE_KEY,
 *      ARC_GITHUB_PAT
 */

const main = (): void => {
  const hasApp =
    !!process.env.ARC_GITHUB_APP_ID &&
    !!process.env.ARC_GITHUB_APP_INSTALL_ID &&
    !!process.env.ARC_GITHUB_APP_PRIVATE_KEY;

  const hasPat = !!process.env.ARC_GITHUB_PAT;

  if (!hasApp && !hasPat) {
    console.error('::error::ARC authentication secrets are missing or empty.');
    console.error('Configure either:');
    console.error(
      '  - ARC_GITHUB_APP_ID, ARC_GITHUB_APP_INSTALL_ID, ARC_GITHUB_APP_PRIVATE_KEY (GitHub App), or',
    );
    console.error('  - ARC_GITHUB_PAT (Personal Access Token)');
    console.error(
      'in Settings → Secrets and variables → Actions for this repository (or its organization).',
    );
    process.exit(1);
  }

  console.log('ARC secrets are present.');
};

main();
