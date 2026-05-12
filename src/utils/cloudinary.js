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
const envFile = fs.readFileSync(path.join(__dirname, '../.env'));
const envConfig = dotenv.parse(envFile);

// Configure Cloudinary synchronously using the parsed text
cloudinary.config({
  cloud_name: 'digevwnel',
  api_key: envConfig.CLOUDINARY_API_KEY,
  api_secret: envConfig.CLOUDINARY_API_SECRET,
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
