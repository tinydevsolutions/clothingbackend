import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// CRITICAL: Force dotenv to parse the absolute file because ES Modules hoist imports 
// before `server.js` has a chance to run dotenv.config().
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');

let envConfig = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath);
  envConfig = dotenv.parse(envFile);
}

// Configure Cloudinary using parsed config or existing process.env
const cloudName = envConfig.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'digevwnel';
const apiKey = envConfig.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;

console.log(`[Cloudinary] Initializing with Cloud Name: ${cloudName}, API Key: ${apiKey ? '***' + apiKey.slice(-4) : 'MISSING'}`);

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: envConfig.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clothing_demo/reels',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }], // Optimize
  },
});

export const upload = multer({ storage });
export { cloudinary };
