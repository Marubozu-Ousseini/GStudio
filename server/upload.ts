import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { Storage } from '@google-cloud/storage';

// If GCS bucket provided, use memory storage then push to GCS in route handler.
const useGcs = Boolean(process.env.GCS_BUCKET);

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Utilisez JPG, PNG ou WebP'));
  }
};

export const upload = multer({
  storage: useGcs ? multer.memoryStorage() : diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Helper to upload buffer to GCS
export async function uploadBufferToGCS(file: Express.Multer.File): Promise<string> {
  if (!process.env.GCS_BUCKET) throw new Error('GCS_BUCKET not configured');
  const storage = new Storage();
  const bucket = storage.bucket(process.env.GCS_BUCKET);

  const ext = path.extname(file.originalname) || '.bin';
  const base = path.basename(file.originalname, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 40);
  const filename = `${base}-${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`;
  const blob = bucket.file(filename);
  await blob.save(file.buffer, {
    contentType: file.mimetype,
    resumable: false,
    public: true,
    metadata: { cacheControl: 'public, max-age=31536000' }
  });
  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}
