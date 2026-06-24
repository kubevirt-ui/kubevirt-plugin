/**
 * File system operations utility for tests.
 * Provides methods for reading, writing, and managing files and directories.
 */

import * as fs from 'fs';
import * as path from 'path';

export class FileUtils {
  static readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): string {
    return fs.readFileSync(filePath, encoding);
  }

  static readFileTrimmed(filePath: string, encoding: BufferEncoding = 'utf-8'): string {
    return fs.readFileSync(filePath, encoding).trim();
  }

  static exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  static writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): void {
    fs.writeFileSync(filePath, content, encoding);
  }

  static deleteFile(filePath: string): boolean {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  static createDirectory(dirPath: string): void {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  static getFileName(filePath: string): string {
    return path.basename(filePath);
  }

  static getDirectory(filePath: string): string {
    return path.dirname(filePath);
  }

  static joinPath(...segments: string[]): string {
    return path.join(...segments);
  }

  static resolvePath(...segments: string[]): string {
    return path.resolve(...segments);
  }
}
