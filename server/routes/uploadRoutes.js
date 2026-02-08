import express from 'express';
import { verifyToken, requireShelter } from '../middleware/authMiddleware.js';
import { uploadImages, uploadDocuments, uploadPetFiles, getFileUrl } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Log all requests to upload routes BEFORE any middleware
router.use((req, res, next) => {
  console.log(`\n=== UPLOAD REQUEST ===`);
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  console.log(`Content-Type: ${req.headers['content-type']}`);
  next();
});

// Upload multiple images
router.post('/images', verifyToken, requireShelter, (req, res, next) => {
  uploadImages.array('images', 5)(req, res, (err) => {
    if (err) {
       console.error('Multer Error in route wrapper:', err);
       return next(err);
    }
    next();
  });
}, (req, res) => {
  try {
    console.log('Upload images request received');
    console.log('Files received:', req.files ? req.files.length : 0);
    
    if (!req.files || req.files.length === 0) {
      console.log('No files found in req.files');
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const urls = req.files.map(file => getFileUrl(file.filename, 'images'));
    
    res.json({
      message: 'Images uploaded successfully',
      urls,
      count: urls.length
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

// Upload multiple documents (PDFs, etc.)
router.post('/documents', verifyToken, uploadDocuments.array('documents', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No documents uploaded' });
    }

    const urls = req.files.map(file => getFileUrl(file.filename, 'documents'));
    
    res.json({
      message: 'Documents uploaded successfully',
      urls,
      count: urls.length
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ message: 'Failed to upload documents' });
  }
});

// Upload pet images and documents together
router.post('/pet-files', verifyToken, requireShelter, 
  uploadPetFiles.fields([
    { name: 'images', maxCount: 5 },
    { name: 'documents', maxCount: 10 }
  ]), 
  (req, res) => {
    try {
      const imageUrls = (req.files?.images || []).map(file => getFileUrl(file.filename, 'images'));
      const documentUrls = (req.files?.documents || []).map(file => getFileUrl(file.filename, 'documents'));
      
      res.json({
        message: 'Files uploaded successfully',
        images: imageUrls,
        documents: documentUrls
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ message: 'Failed to upload files' });
    }
  }
);

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Max size is 10MB.' });
  }
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ message: 'Too many files.' });
  }
  if (error.message) {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

export default router;
