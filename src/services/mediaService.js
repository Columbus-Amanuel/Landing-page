import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from 'firebase/storage';
import { storage } from './firebase';

const MEDIA_ROOT = 'media';

/** Maximum single-file upload size (50 MB). */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

/**
 * @param {string} name
 * @returns {string}
 */
export function sanitizeMediaFileName(name) {
  const base = String(name)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
  return base.slice(0, 120) || 'file';
}

/**
 * @param {string} fileName
 * @returns {string}
 */
export function buildMediaStoragePath(fileName) {
  return `${MEDIA_ROOT}/${Date.now()}_${sanitizeMediaFileName(fileName)}`;
}

/**
 * @typedef {Object} MediaFile
 * @property {string} name
 * @property {string} fullPath
 * @property {string} url
 * @property {string} [contentType]
 * @property {number} [size]
 * @property {string} [updated]
 */

/**
 * List all files in the `media/` Storage folder.
 * @returns {Promise<MediaFile[]>}
 */
export const listMediaFiles = async () => {
  const rootRef = ref(storage, MEDIA_ROOT);
  const result = await listAll(rootRef);
  const files = await Promise.all(
    result.items.map(async (itemRef) => {
      const [url, meta] = await Promise.all([
        getDownloadURL(itemRef),
        getMetadata(itemRef),
      ]);
      return {
        name: itemRef.name,
        fullPath: itemRef.fullPath,
        url,
        contentType: meta.contentType,
        size: meta.size,
        updated: meta.updated,
      };
    }),
  );
  return files.sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
};

/**
 * Upload a file to `media/` with resumable progress callbacks.
 * @param {File} file
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<MediaFile>}
 */
export const uploadMediaFile = (file, onProgress) => {
  if (file.size > MAX_UPLOAD_BYTES) {
    return Promise.reject(new Error('FILE_TOO_LARGE'));
  }

  const storageRef = ref(storage, buildMediaStoragePath(file.name));
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || undefined,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      reject,
      async () => {
        const itemRef = uploadTask.snapshot.ref;
        const [url, meta] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef),
        ]);
        resolve({
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          url,
          contentType: meta.contentType,
          size: meta.size,
          updated: meta.updated,
        });
      },
    );
  });
};

/**
 * @param {string} fullPath Storage full path (e.g. `media/123_photo.jpg`)
 */
export const deleteMediaFile = (fullPath) => deleteObject(ref(storage, fullPath));
