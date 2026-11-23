import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

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

