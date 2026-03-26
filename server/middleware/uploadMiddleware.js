import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  // Use the full URL if provided (Cloudinary SDK handles this)
  cloudinary.config(true);
} else {
  // Otherwise use individual properties
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Storage configuration for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'petmate/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `pet-${uniqueSuffix}`;
    }
  }
});

// Storage configuration for documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'petmate/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `doc-${uniqueSuffix}`;
    }
  }
});

// Multer upload configurations
export const uploadImages = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
  }
});

export const uploadDocuments = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per document
  }
});

// Combined upload for pet form (images + documents)
// Cloudinary doesn't support generic 'fields' storage easily in one config if folders differ,
// but we can use multiple multer instances or a dynamic folder logic.
// For simplicity and to match existing patterns:
export const uploadPetFiles = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const folder = file.fieldname === 'images' ? 'petmate/images' : 'petmate/documents';
      const prefix = file.fieldname === 'images' ? 'pet' : 'doc';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return {
        folder: folder,
        public_id: `${prefix}-${uniqueSuffix}`,
        resource_type: 'auto'
      };
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Helper to get file URL from filename - Now just returns the full path from Cloudinary
export const getFileUrl = (file) => {
  return file.path; // multer-storage-cloudinary populates 'path' with the Cloudinary URL
};

// Helper to delete a file from Cloudinary
export const deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};
