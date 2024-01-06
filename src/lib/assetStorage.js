const cloudinary = require("cloudinary").v2;

const UploadPreset = {
  profilePic: "profile-pic",
  productImg: "product-img",
};

const config = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

//eslint-disable-next-line
const CLOUDINARY_REGEX =
  /^.+\.cloudinary\.com\/(?:[^/]+\/)(?:(image|video|raw)\/)?(?:(upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/)?(?:(?:[^_/]+_[^,/]+,?)*\/)?(?:v(\d+|\w{1,2})\/)?([^.^\s]+)(?:\.(.+))?$/;

const extractPublicId = (link) => {
  if (!link) return "";

  const parts = CLOUDINARY_REGEX.exec(link);

  return parts && parts.length > 2 ? parts[parts.length - 2] : link;
};

const isValidUrl = (str) => {
  let url;

  try {
    url = new URL(str);
  } catch (_) {
    return false;
  }

  return (
    (url.protocol === "http:" || url.protocol === "https:") &&
    url.hostname === "res.cloudinary.com"
  );
};

/**
 * Generate authentication signatures for uploading images
 * @param {keyof UploadPreset} imgType
 * @returns
 */
exports.genUploadSignatures = (imgType, subfolder) => {
  const uploadPreset = UploadPreset[imgType];
  const folder = subfolder ? `${uploadPreset}/${subfolder}` : null;
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      upload_preset: uploadPreset,
      ...(folder ? { folder: folder } : {}),
    },
    config.api_secret,
  );

  return {
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    signature: signature,
    timestamp: timestamp,
    upload_preset: uploadPreset,
    ...(folder ? { folder: folder } : {}),
  };
};

/**
 *
 * @param {string} source Source of the image
 * @returns
 */
exports.deleteImage = async (source) => {
  if (!isValidUrl(source)) return;
  const publicId = extractPublicId(source);

  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId);
};

/**
 *
 * @param {string} source
 * @returns {boolean}
 */
exports.isValidSource = (source) => {
  return isValidUrl(source) ? !!extractPublicId(source) : false;
};
