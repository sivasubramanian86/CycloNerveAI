/**
 * CycloNerveAI - Upload Type, Size & MIME Magic-Byte Validator
 * Strictly verifies file uploads (satellite SAR, drone footage, GIS GeoJSON)
 * using true binary magic bytes rather than trusting client-supplied Content-Type.
 */

import crypto from 'crypto';
import { UploadedFileMetadata } from './types.ts';
import { auditLogService } from './auditLogService.ts';

// Allowed MIME signatures and byte headers
interface AllowedMimeDef {
  mime: string;
  extensions: string[];
  maxBytes: number;
  magicCheck: (buffer: Buffer) => boolean;
}

const ALLOWED_MIME_TYPES: Record<string, AllowedMimeDef> = {
  'image/jpeg': {
    mime: 'image/jpeg',
    extensions: ['.jpg', '.jpeg'],
    maxBytes: 10 * 1024 * 1024, // 10MB
    magicCheck: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  'image/png': {
    mime: 'image/png',
    extensions: ['.png'],
    maxBytes: 10 * 1024 * 1024, // 10MB
    magicCheck: (buf) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
  },
  'image/tiff': {
    mime: 'image/tiff',
    extensions: ['.tif', '.tiff'],
    maxBytes: 50 * 1024 * 1024, // 50MB (satellite SAR)
    magicCheck: (buf) =>
      buf.length >= 4 &&
      ((buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2a && buf[3] === 0x00) || // Little-endian
        (buf[0] === 0x4d && buf[1] === 0x4d && buf[2] === 0x00 && buf[3] === 0x2a)), // Big-endian
  },
  'application/pdf': {
    mime: 'application/pdf',
    extensions: ['.pdf'],
    maxBytes: 15 * 1024 * 1024, // 15MB
    magicCheck: (buf) =>
      buf.length >= 4 &&
      buf[0] === 0x25 && // %
      buf[1] === 0x50 && // P
      buf[2] === 0x44 && // D
      buf[3] === 0x46, // F
  },
  'application/geo+json': {
    mime: 'application/geo+json',
    extensions: ['.geojson', '.json'],
    maxBytes: 5 * 1024 * 1024, // 5MB
    magicCheck: (buf) => {
      try {
        const text = buf.toString('utf8').trim();
        if (!text.startsWith('{')) return false;
        const parsed = JSON.parse(text);
        return parsed && (parsed.type === 'FeatureCollection' || parsed.type === 'Feature' || parsed.type === 'Polygon');
      } catch {
        return false;
      }
    },
  },
  'application/json': {
    mime: 'application/json',
    extensions: ['.json'],
    maxBytes: 5 * 1024 * 1024,
    magicCheck: (buf) => {
      try {
        const text = buf.toString('utf8').trim();
        return (text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'));
      } catch {
        return false;
      }
    },
  },
};

// Forbidden extensions that must always be blocked
const BLOCKED_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.bin',
  '.js',
  '.mjs',
  '.ts',
  '.py',
  '.php',
  '.rb',
  '.pl',
  '.svg', // Often carries embedded XML/JavaScript
  '.html',
  '.htm',
  '.dll',
  '.so',
]);

/**
 * Validates an uploaded file payload using size, extension, and binary magic bytes.
 */
export function validateUploadedBuffer(
  buffer: Buffer,
  filename: string,
  claimedMimeType?: string
): UploadedFileMetadata {
  const extensionMatch = filename.match(/\.[a-zA-Z0-9]+$/);
  const extension = extensionMatch ? extensionMatch[0].toLowerCase() : '';
  const sizeBytes = buffer.length;
  const sha256Digest = crypto.createHash('sha256').update(buffer).digest('hex');

  // Check 1: Blocked extension
  if (BLOCKED_EXTENSIONS.has(extension)) {
    auditLogService.recordEvent({
      action: 'UPLOAD_REJECTED_EXECUTABLE_EXT',
      actor: { role: 'Viewer', userId: 'ANONYMOUS_UPLOADER' },
      resource: filename,
      status: 'REJECTED_MALFORMED',
      details: { extension, sizeBytes },
      isSimulated: true,
    });

    return {
      filename,
      sizeBytes,
      mimeType: claimedMimeType || 'unknown',
      detectedMimeType: 'application/x-executable-or-script',
      extension,
      isValid: false,
      validationError: `File extension '${extension}' is strictly prohibited for security.`,
      sha256Digest,
    };
  }

  // Check 2: Detect true MIME from magic bytes
  let detectedMimeType: string | null = null;
  for (const [mime, def] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (def.magicCheck(buffer)) {
      detectedMimeType = mime;
      break;
    }
  }

  if (!detectedMimeType) {
    auditLogService.recordEvent({
      action: 'UPLOAD_REJECTED_UNKNOWN_MAGIC_BYTES',
      actor: { role: 'Viewer', userId: 'ANONYMOUS_UPLOADER' },
      resource: filename,
      status: 'REJECTED_MALFORMED',
      details: { extension, sizeBytes, claimedMimeType },
      isSimulated: true,
    });

    return {
      filename,
      sizeBytes,
      mimeType: claimedMimeType || 'unknown',
      detectedMimeType: 'unknown',
      extension,
      isValid: false,
      validationError: 'File content does not match any recognized and allowed binary MIME signature.',
      sha256Digest,
    };
  }

  const allowedDef = ALLOWED_MIME_TYPES[detectedMimeType];

  // Check 3: Extension compatibility with detected MIME
  if (!allowedDef.extensions.includes(extension)) {
    auditLogService.recordEvent({
      action: 'UPLOAD_REJECTED_MIME_EXTENSION_MISMATCH',
      actor: { role: 'Viewer', userId: 'ANONYMOUS_UPLOADER' },
      resource: filename,
      status: 'REJECTED_MALFORMED',
      details: { extension, detectedMimeType },
      isSimulated: true,
    });

    return {
      filename,
      sizeBytes,
      mimeType: claimedMimeType || detectedMimeType,
      detectedMimeType,
      extension,
      isValid: false,
      validationError: `Extension '${extension}' does not match detected MIME '${detectedMimeType}'. Allowed: ${allowedDef.extensions.join(', ')}.`,
      sha256Digest,
    };
  }

  // Check 4: Size threshold
  if (sizeBytes > allowedDef.maxBytes) {
    auditLogService.recordEvent({
      action: 'UPLOAD_REJECTED_FILE_TOO_LARGE',
      actor: { role: 'Viewer', userId: 'ANONYMOUS_UPLOADER' },
      resource: filename,
      status: 'REJECTED_MALFORMED',
      details: { sizeBytes, maxAllowedBytes: allowedDef.maxBytes },
      isSimulated: true,
    });

    return {
      filename,
      sizeBytes,
      mimeType: detectedMimeType,
      detectedMimeType,
      extension,
      isValid: false,
      validationError: `File size ${sizeBytes} bytes exceeds maximum limit of ${allowedDef.maxBytes} bytes for ${detectedMimeType}.`,
      sha256Digest,
    };
  }

  return {
    filename,
    sizeBytes,
    mimeType: detectedMimeType,
    detectedMimeType,
    extension,
    isValid: true,
    sha256Digest,
  };
}
