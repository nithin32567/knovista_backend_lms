import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export function handleOptionalProfilePic(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.includes('multipart/form-data')) {
    next();
    return;
  }

  memoryUpload.single('profile_pic')(req, res, (err: unknown) => {
    if (err) {
      next(err);
      return;
    }
    next();
  });
}

const programsUploadsDir = path.join(process.cwd(), 'uploads', 'programs');
if (!fs.existsSync(programsUploadsDir)) {
  fs.mkdirSync(programsUploadsDir, { recursive: true });
}

const programStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, programsUploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const programUpload = multer({
  storage: programStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export function handleProgramUpload(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.includes('multipart/form-data')) {
    next();
    return;
  }

  programUpload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 },
  ])(req, res, (err: unknown) => {
    if (err) {
      next(err);
      return;
    }
    next();
  });
}

const sectionsUploadsDir = path.join(process.cwd(), 'uploads', 'sections');
if (!fs.existsSync(sectionsUploadsDir)) {
  fs.mkdirSync(sectionsUploadsDir, { recursive: true });
}

const sectionStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, sectionsUploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const sectionUpload = multer({
  storage: sectionStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export function handleSectionUpload(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.includes('multipart/form-data')) {
    next();
    return;
  }

  sectionUpload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 },
  ])(req, res, (err: unknown) => {
    if (err) {
      next(err);
      return;
    }
    next();
  });
}
