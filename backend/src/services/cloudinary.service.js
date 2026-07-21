import cloudinary from '../config/cloudinary.js';

export function extractPublicId(videoUrl) {
  try {
    const url = new URL(videoUrl);
    const pathParts = url.pathname.split('/');
    const versionIdx = pathParts.findIndex(p => /^v\d+$/.test(p));
    if (versionIdx === -1) return null;
    return pathParts.slice(versionIdx + 1).join('/').replace(/\.[^.]+$/, '');
  } catch {
    return null;
  }
}

export function uploadVideo(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        type: 'authenticated',
        folder: 'boyztrade/lessons',
        eager: [{ streaming_profile: 'hd', format: 'm3u8' }],
        eager_async: true,
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export function uploadImage(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'boyztrade/courses',
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Deletes a video from Cloudinary
 * @param {string} publicId - The public ID of the video to delete
 * @returns {Promise} - A promise that resolves when the video is deleted
 * @throws {Error} - Throws an error if the deletion fails
 */
export async function deleteVideo(publicId, options = {}) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'video', type: 'authenticated', ...options });
}

/**
 * Deletes an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise} - A promise that resolves when the image is deleted
 * @throws {Error} - Throws an error if the deletion fails
 */
export async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}


/**
 * Generates a signed URL for accessing a video or image from Cloudinary
 * @param {string} publicId - The public ID of the video or image
 * @param {Object} options - Options for generating the signed URL
 * @param {string} [options.resourceType='video'] - The resource type ('video' or 'image')
 * @param {string} [options.type='authenticated'] - The type of URL ('authenticated' or 'private')
 * @param {number} [options.expiresAt] - The expiration time in seconds since epoch (default: 1 hour from now)
 * @returns {string} - The signed URL
 * @throws {Error} - Throws an error if the URL generation fails
*/
export function getSignedUrl(publicId, options = {}) {
  const { resourceType = 'video', type = 'authenticated', expiresAt } = options;

  const expires_at = expiresAt || Math.floor(Date.now() / 1000) + 3600;

  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type,
    sign_url: true,
    expires_at,
  });
}
