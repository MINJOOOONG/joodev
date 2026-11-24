import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { isAdminRequest } from "@/lib/session";
import { MAX_UPLOAD_BYTES, UPLOAD_CONTENT_TYPES, uploadValidationError } from "@/lib/upload-policy";

export const runtime = "nodejs";

function filenameFor(type: string) {
  const extension = UPLOAD_CONTENT_TYPES[type as keyof typeof UPLOAD_CONTENT_TYPES];
  return `${Date.now()}-${randomUUID()}.${extension}`;
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
    if (!useBlob && process.env.VERCEL) {
      return NextResponse.json({ error: "현재 파일을 업로드할 수 없습니다." }, { status: 503 });
    }

    if (request.headers.get("content-type")?.includes("application/json")) {
      const file = await request.json();
      if (!file || typeof file.type !== "string" || typeof file.size !== "number") {
        return NextResponse.json({ error: "파일 정보가 올바르지 않습니다." }, { status: 400 });
      }
      const error = uploadValidationError(file);
      if (error) return NextResponse.json({ error }, { status: 400 });
      if (!useBlob) return NextResponse.json({ strategy: "local" });

      const pathname = `blog/${filenameFor(file.type)}`;
      // File bytes go directly to Blob. Only a token limited to this one media
      // path, content type, size and expiration leaves the server.
      const token = await generateClientTokenFromReadWriteToken({
        pathname,
        allowedContentTypes: [file.type],
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
        validUntil: Date.now() + 10 * 60 * 1000,
        addRandomSuffix: true,
        allowOverwrite: false,
      });
      return NextResponse.json(
        { strategy: "blob", pathname, token },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // Local uploads, and small uploads from editors opened before an update.
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "파일이 선택되지 않았습니다." }, { status: 400 });
    }
    const error = uploadValidationError(file);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const filename = filenameFor(file.type);
    if (useBlob) {
      const blob = await put(`blog/${filename}`, file, { access: "public" });
      return NextResponse.json({ url: blob.url });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
    console.error("Media upload failed");
    return NextResponse.json({ error: "업로드에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
