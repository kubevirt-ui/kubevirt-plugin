import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { TestTimeouts } from '@/utils/test-config';

import { generateRandomString } from '../utils/random-data-generator';

/**
 * Data factory for generating RSA SSH public key files
 *
 * Generates RSA key pairs and writes the public key to a file in the .test-data directory.
 * The generated files are automatically cleaned up during global teardown.
 */
export class SshKeyFactory {
  private static readonly TEST_DATA_DIR = '.test-data';

  /**
   * Ensures the .test-data directory exists
   * @returns The absolute path to the .test-data directory
   */
  private static ensureTestDataDirectory(): string {
    const projectRoot = process.cwd();
    const testDataDir = path.join(projectRoot, this.TEST_DATA_DIR);

    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    return testDataDir;
  }

  /**
   * Generates an RSA key pair (both private and public keys) in the .test-data directory
   *
   * Uses ssh-keygen to generate a valid RSA key pair and saves both keys.
   * The private key is saved with restricted permissions (600) for security.
   *
   * @param baseFilename - Base filename for the keys (default: 'rsa')
   *                       Private key will be: 'rsa'
   *                       Public key will be: 'rsa.pub'
   * @returns An object containing paths to both the private and public key files
   *
   * @example
   * ```typescript
   * const { privateKeyPath, publicKeyPath } = SshKeyFactory.generateKeyPair();
   * // Returns: { privateKeyPath: '/path/to/.test-data/rsa', publicKeyPath: '/path/to/.test-data/rsa.pub' }
   * ```
   */
  static generateKeyPair(baseFilename = 'rsa'): {
    privateKeyPath: string;
    publicKeyPath: string;
  } {
    const testDataDir = this.ensureTestDataDirectory();

    // Add unique random suffix to avoid conflicts between parallel tests
    const uniqueSuffix = generateRandomString(8, 'alphanumeric').toLowerCase();
    const uniqueFilename = `${baseFilename}-${uniqueSuffix}`;
    const privateKeyPath = path.join(testDataDir, uniqueFilename);
    const publicKeyPath = `${privateKeyPath}.pub`;

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Remove existing files if they exist (shouldn't happen with unique suffix, but just in case)
        if (fs.existsSync(privateKeyPath)) {
          fs.unlinkSync(privateKeyPath);
        }
        if (fs.existsSync(publicKeyPath)) {
          fs.unlinkSync(publicKeyPath);
        }

        // Generate RSA key pair using ssh-keygen
        // -t rsa: RSA key type
        // -b 2048: 2048-bit key size
        // -f: output file path
        // -N '': empty passphrase
        // -q: quiet mode
        execSync(`ssh-keygen -t rsa -b 2048 -f "${privateKeyPath}" -N '' -q`, {
          stdio: 'pipe',
          timeout: TestTimeouts.DEFAULT,
        });

        // Verify the files were created
        if (!fs.existsSync(privateKeyPath)) {
          throw new Error(`Private key file was not created at ${privateKeyPath}`);
        }
        if (!fs.existsSync(publicKeyPath)) {
          throw new Error(`Public key file was not created at ${publicKeyPath}`);
        }

        // Verify the public key has content
        const publicKeyContent = fs.readFileSync(publicKeyPath, 'utf-8').trim();
        if (!publicKeyContent || !publicKeyContent.startsWith('ssh-rsa')) {
          throw new Error('Generated public key appears to be invalid');
        }

        // Set restrictive permissions on private key (read/write for owner only)
        // This is important for SSH security - private keys should not be readable by others
        try {
          fs.chmodSync(privateKeyPath, 0o600);
        } catch {
          // Ignore chmod errors on Windows or if not supported
        }

        return {
          privateKeyPath,
          publicKeyPath,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Clean up any partial files on failure
        try {
          if (fs.existsSync(privateKeyPath)) fs.unlinkSync(privateKeyPath);
          if (fs.existsSync(publicKeyPath)) fs.unlinkSync(publicKeyPath);
        } catch {
          // Ignore cleanup errors
        }

        if (attempt < maxRetries) {
          // Wait briefly before retrying
          const waitMs = attempt * 100;
          const waitUntil = Date.now() + waitMs;
          while (Date.now() < waitUntil) {
            // Busy wait (sync)
          }
        }
      }
    }

    throw new Error(
      `Failed to generate SSH key pair after ${maxRetries} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Generates an RSA public key file in the .test-data directory
   *
   * Uses ssh-keygen to generate a valid RSA key pair and extracts the public key.
   * The format matches the cypress rsa.pub file format: "ssh-rsa <base64> <comment>"
   *
   * @param filename - Optional filename for the public key file (default: 'rsa.pub')
   * @returns The absolute file path to the generated public key file
   *
   * @example
   * ```typescript
   * const publicKeyPath = SshKeyFactory.generatePublicKeyFile();
   * // Returns: '/path/to/project/.test-data/rsa.pub'
   * ```
   */
  static generatePublicKeyFile(filename = 'rsa.pub'): string {
    const testDataDir = this.ensureTestDataDirectory();
    const filePath = path.join(testDataDir, filename);
    const privateKeyPath = path.join(testDataDir, 'rsa_temp');

    try {
      // Generate RSA key pair using ssh-keygen
      // -t rsa: RSA key type
      // -b 2048: 2048-bit key size
      // -f: output file path
      // -N '': empty passphrase
      // -q: quiet mode
      execSync(`ssh-keygen -t rsa -b 2048 -f "${privateKeyPath}" -N '' -q`, { stdio: 'ignore' });

      // Read the generated public key
      const publicKeyContent = fs.readFileSync(`${privateKeyPath}.pub`, 'utf-8');

      // Write public key to the target file
      fs.writeFileSync(filePath, publicKeyContent, 'utf-8');

      // Clean up temporary private key files
      try {
        if (fs.existsSync(privateKeyPath)) {
          fs.unlinkSync(privateKeyPath);
        }
        if (fs.existsSync(`${privateKeyPath}.pub`)) {
          fs.unlinkSync(`${privateKeyPath}.pub`);
        }
      } catch (cleanupError) {
        // Ignore cleanup errors - not critical
      }

      return filePath;
    } catch (error) {
      // Fallback: Generate a valid-looking SSH key if ssh-keygen is not available
      const hostname = process.env.HOSTNAME || 'exec1.rdocloud';
      const username = process.env.USER || 'root';
      const comment = `${username}@${hostname}`;

      // Generate a valid SSH-rsa key format (simplified for testing)
      // This is a fallback if ssh-keygen is not available
      // Note: This key won't be cryptographically valid but will have the correct format
      const keyData = Buffer.alloc(256);
      keyData.fill(0);
      const base64Key = keyData.toString('base64');
      const sshPublicKey = `ssh-rsa ${base64Key} ${comment}\n`;

      fs.writeFileSync(filePath, sshPublicKey, 'utf-8');

      return filePath;
    }
  }

  /**
   * Gets the test data directory path
   * @returns The absolute path to the .test-data directory
   */
  static getTestDataDirectory(): string {
    const projectRoot = process.cwd();
    return path.join(projectRoot, this.TEST_DATA_DIR);
  }
}
