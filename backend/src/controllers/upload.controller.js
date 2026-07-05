import { uploadVideo as uploadVideoToCloudinary, uploadImage, getSignedUrl } from '../services/cloudinary.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import Response from '../utils/Response.js';
import ErrorResponse from '../utils/ErrorResponse.js';

export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ErrorResponse(400, 'No video file provided');

  const result = await uploadVideoToCloudinary(req.file.buffer);

  const previewUrl = getSignedUrl(result.public_id);

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

  const result = await uploadImage(req.file.buffer);

  return Response.success(res, {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
  }, 'Cover image uploaded successfully');
});
