/**
 * UploadThing Adapter
 * 
 * Provides a unified interface for file upload operations using UploadThing.
 * This adapter handles file uploads, deletions, and file metadata operations.
 * 
 * For the actual FileRouter configuration, see:
 * - /src/app/api/uploadthing/core.ts - Route definitions and permissions
 * - /src/app/api/uploadthing/route.ts - API route handler
 * - /src/lib/uploadthing.ts - Client components
 */

import { UTApi } from "uploadthing/server";

export class UploadThingAdapter {
  private utapi: UTApi;

  constructor() {
    this.utapi = new UTApi();
  }

  /**
   * Delete files from UploadThing by their file keys
   * @param fileKeys - Array of file keys to delete
   */
  async deleteFiles(fileKeys: string[]): Promise<void> {
    try {
      await this.utapi.deleteFiles(fileKeys);
    } catch (error) {
      console.error("Failed to delete files from UploadThing:", error);
      throw new Error("Failed to delete files");
    }
  }

  /**
   * Get file URLs from UploadThing
   * @param fileKeys - Array of file keys
   * @returns Array of file data with URLs
   */
  async getFileUrls(fileKeys: string[]): Promise<Array<{ key: string; url: string }>> {
    try {
      const files = await this.utapi.getFileUrls(fileKeys);
      return files.data.map((file: { key: string; url: string }) => ({
        key: file.key,
        url: file.url,
      }));
    } catch (error) {
      console.error("Failed to get file URLs from UploadThing:", error);
      throw new Error("Failed to get file URLs");
    }
  }

  /**
   * List all files for the authenticated user
   * @param limit - Maximum number of files to return
   * @param offset - Number of files to skip
   */
  async listFiles(limit = 100, offset = 0) {
    try {
      const { files, hasMore } = await this.utapi.listFiles({ limit, offset });
      return { files, hasMore };
    } catch (error) {
      console.error("Failed to list files from UploadThing:", error);
      throw new Error("Failed to list files");
    }
  }
}
