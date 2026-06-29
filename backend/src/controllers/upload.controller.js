import cloudinary from '../config/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';
import Response from '../utils/Response.js';
import ErrorResponse from '../utils/ErrorResponse.js';

export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ErrorResponse(400, 'No video file provided');

  const buffer = req.file.buffer;

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        type: 'authenticated',
        folder: 'boyztrade/lessons',
        eager: [{ streaming_profile: 'hd', format: 'm3u8' }],
        eager_async: true,
      },
      (error, result) => {
        if (error) reject(new ErrorResponse(500, error.message || 'Cloudinary upload failed'));
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

  const previewUrl = cloudinary.url(result.public_id, {
    resource_type: 'video',
    type: 'authenticated',
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });

  return Response.success(res, {
    url: result.secure_url,
    publicId: result.public_id,
    previewUrl,
    duration: Math.round(result.duration || 0),
    format: result.format,
    width: result.width,
    height: result.height,
  }, 'Video uploaded successfully');
});

export const uploadCover = asyncHandler(async (req, res) => {
  if (!req.file) throw new ErrorResponse(400, 'No image file provided');

  const buffer = req.file.buffer;

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'boyztrade/courses',
      },
      (error, result) => {
        if (error) reject(new ErrorResponse(500, error.message || 'Cloudinary upload failed'));
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

  return Response.success(res, {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
  }, 'Cover image uploaded successfully');
});
