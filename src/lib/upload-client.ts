"use client";

import { put } from "@vercel/blob/client";
import { uploadValidationError } from "./upload-policy";

function responseError(status: number, data?: { error?: string }) {
  if (status === 401) return "로그인이 만료되었습니다. 다시 로그인해 주세요.";
  return data?.error || `업로드 실패 (${status})`;
}

export async function uploadMedia(file: File, onProgress?: (percentage: number) => void): Promise<string> {
  const error = uploadValidationError(file);
  if (error) throw new Error(error);
  onProgress?.(0);

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: file.type, size: file.size }),
  });
  const authorization = await response.json();
  if (!response.ok) throw new Error(responseError(response.status, authorization));

  if (authorization.strategy === "blob") {
    const blob = await put(authorization.pathname, file, {
      access: "public",
      token: authorization.token,
      contentType: file.type,
      multipart: file.size > 5 * 1024 * 1024,
      onUploadProgress: ({ percentage }) => onProgress?.(Math.round(percentage)),
    });
    onProgress?.(100);
    return blob.url;
  }
  if (authorization.strategy !== "local") throw new Error("업로드를 준비하지 못했습니다.");

  return new Promise<string>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress?.(Math.round(event.loaded / event.total * 100));
    });
    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && typeof data.url === "string") resolve(data.url);
        else reject(new Error(responseError(xhr.status, data)));
      } catch {
        reject(new Error(responseError(xhr.status)));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("네트워크 오류가 발생했습니다.")));
    xhr.addEventListener("abort", () => reject(new Error("업로드가 취소되었습니다.")));
    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  });
}
