export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export const UPLOAD_CONTENT_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
} as const;

export function uploadValidationError(file: { type: string; size: number }): string | null {
  if (!Object.prototype.hasOwnProperty.call(UPLOAD_CONTENT_TYPES, file.type)) {
    return "지원하지 않는 파일 형식입니다.";
  }
  if (!Number.isSafeInteger(file.size) || file.size <= 0) {
    return "비어 있거나 올바르지 않은 파일입니다.";
  }
  if (file.size > MAX_UPLOAD_BYTES) return "파일 크기가 50MB를 초과합니다.";
  return null;
}
