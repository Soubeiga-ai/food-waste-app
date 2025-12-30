// src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const { sendError } = require('../utils/responseHelper');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    // Nom unique : timestamp + nom original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// Filtrage des fichiers (types autorisés)
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB par défaut
  }
});

/**
 * Middleware pour upload d'une seule image
 */
const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendError(res, 400, 'Fichier trop volumineux. Taille maximale: 5MB');
        }
        return sendError(res, 400, `Erreur d'upload: ${err.message}`);
      } else if (err) {
        return sendError(res, 400, err.message);
      }
      next();
    });
  };
};

/**
 * Middleware pour upload de plusieurs images
 */
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);

    multipleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendError(res, 400, 'Un ou plusieurs fichiers sont trop volumineux. Taille maximale: 5MB par fichier');
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return sendError(res, 400, `Trop de fichiers. Maximum autorisé: ${maxCount}`);
        }
        return sendError(res, 400, `Erreur d'upload: ${err.message}`);
      } else if (err) {
        return sendError(res, 400, err.message);
      }
      next();
    });
  };
};

/**
 * Middleware pour upload de plusieurs champs
 */
const uploadFields = (fields) => {
  return (req, res, next) => {
    const fieldsUpload = upload.fields(fields);

    fieldsUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendError(res, 400, 'Un ou plusieurs fichiers sont trop volumineux. Taille maximale: 5MB par fichier');
        }
        return sendError(res, 400, `Erreur d'upload: ${err.message}`);
      } else if (err) {
        return sendError(res, 400, err.message);
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields
};