import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

/**
 * Data factory for creating test files in the .test-data directory.
 *
 * Provides utilities for creating test files (ISO, images, etc.) used in tests.
 * The generated files are stored in the .test-data directory and can be
 * automatically cleaned up during global teardown.
 */
export class TestFileFactory {
  private static readonly TEST_DATA_DIR = '.test-data';

  /**
   * Creates an empty ISO file in the .test-data directory.
   *
   * @param filename - The filename for the ISO file (e.g., 'vm-test-file.iso')
   * @returns The absolute file path to the created ISO file
   *
   * @example
   * ```typescript
   * const isoPath = TestFileFactory.createEmptyIsoFile('vm-test-file.iso');
   * // Returns: '/path/to/project/.test-data/vm-test-file.iso'
   * ```
   */
  static createEmptyIsoFile(filename: string): string {
    const testDataDir = this.ensureTestDataDirectory();
    const filePath = path.join(testDataDir, filename);

    // Create empty ISO file
    fs.writeFileSync(filePath, '');

    return filePath;
  }

  /**
   * Downloads the CirrOS image and saves it with the specified filename.
   *
   * Downloads from: https://download.cirros-cloud.net/0.3.0/cirros-0.3.0-x86_64-disk.img
   *
   * @param filename - The filename for the image file (e.g., 'vm-test-file.img')
   * @returns A Promise that resolves to the absolute file path of the downloaded image
   *
   * @example
   * ```typescript
   * const imgPath = await TestFileFactory.downloadCirrosImage('vm-test-file.img');
   * // Returns: '/path/to/project/.test-data/vm-test-file.img'
   * ```
   */
  static async downloadCirrosImage(filename: string, url?: string): Promise<string> {
    const testDataDir = this.ensureTestDataDirectory();
    const filePath = path.join(testDataDir, filename);
    const cirrosUrl = url || 'https://download.cirros-cloud.net/0.3.0/cirros-0.3.0-x86_64-disk.img';

    // If file already exists, return the path (avoid re-downloading)
    if (fs.existsSync(filePath)) {
      return filePath;
    }

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      const protocol = cirrosUrl.startsWith('https') ? https : http;

      const req = protocol
        .get(cirrosUrl, (response) => {
          if (
            response.statusCode === 301 ||
            response.statusCode === 302 ||
            response.statusCode === 307 ||
            response.statusCode === 308
          ) {
            if (response.headers.location) {
              file.close();
              fs.unlinkSync(filePath);
              const redirectUrl = response.headers.location.startsWith('http')
                ? response.headers.location
                : new URL(response.headers.location, cirrosUrl).toString();
              return this.downloadCirrosImage(filename, redirectUrl).then(resolve).catch(reject);
            }
          }

          if (response.statusCode !== 200) {
            file.close();
            fs.unlinkSync(filePath);
            reject(
              new Error(
                `Failed to download CirrOS image: ${response.statusCode} ${response.statusMessage}`,
              ),
            );
            return;
          }

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            resolve(filePath);
          });
        })
        .on('error', (err) => {
          file.close();
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          reject(err);
        });
      req.setTimeout(30_000, () => {
        req.destroy();
        file.close();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        reject(new Error('CirrOS image download timed out after 30 seconds'));
      });
    });
  }

  /**
   * Downloads an ISO file and saves it with the specified filename.
   *
   * Downloads from a default URL or a custom URL if provided.
   * Common ISO sources: CirrOS, Fedora, etc.
   *
   * @param filename - The filename for the ISO file (e.g., 'test.iso')
   * @param url - Optional URL to download from (default: CirrOS ISO)
   * @returns A Promise that resolves to the absolute file path of the downloaded ISO
   *
   * @example
   * ```typescript
   * const isoPath = await TestFileFactory.downloadIsoFile('test.iso');
   * // Returns: '/path/to/project/.test-data/test.iso'
   * ```
   */
  static async downloadIsoFile(filename: string, url?: string): Promise<string> {
    const testDataDir = this.ensureTestDataDirectory();
    const filePath = path.join(testDataDir, filename);
    // Default to CirrOS ISO - a small, commonly used test ISO
    const isoUrl = url || 'https://download.cirros-cloud.net/0.3.0/cirros-0.3.0-x86_64-disk.iso';

    // If file already exists, return the path (avoid re-downloading)
    if (fs.existsSync(filePath)) {
      return filePath;
    }

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      const protocol = isoUrl.startsWith('https') ? https : http;

      const req = protocol
        .get(isoUrl, (response) => {
          if (
            response.statusCode === 301 ||
            response.statusCode === 302 ||
            response.statusCode === 307 ||
            response.statusCode === 308
          ) {
            if (response.headers.location) {
              file.close();
              fs.unlinkSync(filePath);
              const redirectUrl = response.headers.location.startsWith('http')
                ? response.headers.location
                : new URL(response.headers.location, isoUrl).toString();
              return this.downloadIsoFile(filename, redirectUrl).then(resolve).catch(reject);
            }
          }

          if (response.statusCode !== 200) {
            file.close();
            fs.unlinkSync(filePath);
            reject(
              new Error(
                `Failed to download ISO file: ${response.statusCode} ${response.statusMessage}`,
              ),
            );
            return;
          }

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            resolve(filePath);
          });
        })
        .on('error', (err) => {
          file.close();
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          reject(err);
        });
      req.setTimeout(30_000, () => {
        req.destroy();
        file.close();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        reject(new Error('ISO file download timed out after 30 seconds'));
      });
    });
  }

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
   * Gets the test data directory path
   * @returns The absolute path to the .test-data directory
   */
  static getTestDataDirectory(): string {
    const projectRoot = process.cwd();
    return path.join(projectRoot, this.TEST_DATA_DIR);
  }
}
