import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ValidationError } from '../../../../shared/errors/ValidationError';

const leavesUploadsDir = path.join(process.cwd(), 'uploads', 'leaves');
if (!fs.existsSync(leavesUploadsDir)) {
  fs.mkdirSync(leavesUploadsDir, { recursive: true });
}

const leaveStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, leavesUploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `proof-${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const leaveUpload = multer({
  storage: leaveStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ValidationError('Validation failed', {
          proof: ['Invalid file type. Allowed: jpg, jpeg, png, webp, pdf, doc, docx'],
        }),
      );
    }
  },
});

export function handleLeaveProofUpload(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.includes('multipart/form-data')) {
    next();
    return;
  }

  leaveUpload.single('proof')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      next(new ValidationError('File upload failed', { proof: [err.message] }));
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}

export function getRelativeProofPath(file: Express.Multer.File): string {
  return path.join('leaves', file.filename);
}
