const cloudinary = require('cloudinary').v2;
const ApiError = require('../utils/apiError');

function uploadMemberProfilePhoto(buffer, memberId) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new ApiError(503, 'Profile photo uploads are not configured.');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      resource_type: 'image',
      public_id: `fitnexx_member_${memberId}_profile`,
      overwrite: true,
      invalidate: true,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    }, (error, result) => {
      if (error || !result?.secure_url) {
        return reject(new ApiError(502, 'Photo upload failed. Please try again.'));
      }
      return resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}

module.exports = { uploadMemberProfilePhoto };
