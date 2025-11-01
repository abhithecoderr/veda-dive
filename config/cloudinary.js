// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary'; // ESM syntax for importing
import dotenv from 'dotenv'; // ESM way to load dotenv

dotenv.config({path: "../.env"});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary; // ESM export