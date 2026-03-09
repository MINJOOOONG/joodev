import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const isVercel = !!process.env.VERCEL;

async function uploadToLocal(file: File, filename: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(uploadDir, path.basename(filename));
  await writeFile(filePath, buffer);

  return `/uploads/${path.basename(filename)}`;
}

async function uploadToBlob(file: File, filename: string): Promise<string> {
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 선택되지 않았습니다." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `지원하지 않는 파일 형식입니다: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기가 50MB를 초과합니다." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "bin";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

    if (!useBlob && isVercel) {
      return NextResponse.json(
        { error: "이미지 저장소가 설정되지 않았습니다. Vercel Blob 토큰을 환경변수에 추가해주세요." },
        { status: 500 }
      );
    }

    const url = useBlob
      ? await uploadToBlob(file, `blog/${filename}`)
      : await uploadToLocal(file, filename);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "업로드에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
