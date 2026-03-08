# JooDev Blog - Architecture

## Overview

JooDev Blog는 Next.js 14 App Router 기반의 풀스택 개인 기술 블로그입니다.
고양이 테마의 다크 퍼플 디자인 시스템을 사용하며, 관리자 패널에서 TipTap 리치 텍스트 에디터로 글을 작성하고 관리할 수 있습니다.

## Tech Stack

| 레이어 | 기술 |
|--------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | React 18 + Tailwind CSS 3.4 |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Editor | TipTap (ProseMirror 기반) |
| Code Highlight | CodeBlockLowlight + lowlight + highlight.js |
| Diagram | Mermaid (코드 블록 → SVG 렌더링) |
| Auth | JWT (jose) + 평문 비밀번호 비교 |
| Storage | Vercel Blob (배포) / 로컬 fs (개발) |
| Font | Galmuri (sans), JetBrains Mono (mono) |
| VCS | GitHub (joodev) |
| Hosting | Vercel (배포 예정) |

## Directory Structure

```
blog/
├── prisma/
│   └── schema.prisma          # DB 스키마 (Post, Tag)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (html, body, Galmuri 폰트)
│   │   ├── globals.css         # Tailwind + 커스텀 컴포넌트 + TipTap + 신택스 하이라이팅
│   │   ├── not-found.tsx       # 404 페이지
│   │   ├── (public)/           # 공개 페이지 (Header + Footer 레이아웃)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # 랜딩 페이지 (히어로 + 최근 게시글)
│   │   │   └── blog/
│   │   │       ├── page.tsx    # 블로그 목록
│   │   │       └── [slug]/
│   │   │           └── page.tsx # 게시글 상세
│   │   ├── admin/              # 관리자 페이지 (인증 필요)
│   │   │   ├── layout.tsx      # ToastProvider 포함
│   │   │   ├── login/
│   │   │   │   └── page.tsx    # 로그인
│   │   │   └── posts/
│   │   │       ├── page.tsx    # 게시글 목록/관리
│   │   │       ├── new/
│   │   │       │   └── page.tsx # 새 글 작성
│   │   │       └── [id]/
│   │   │           └── edit/
│   │   │               └── page.tsx # 글 수정
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts # POST: 로그인 / DELETE: 로그아웃
│   │       │   └── check/
│   │       │       └── route.ts # GET: 세션 확인
│   │       ├── posts/
│   │       │   ├── route.ts    # GET: 목록 / POST: 생성
│   │       │   └── [id]/
│   │       │       └── route.ts # GET / PUT / DELETE
│   │       └── upload/
│   │           └── route.ts    # POST: 파일 업로드 (Blob 또는 로컬)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── header.tsx      # 공개 사이트 네비게이션
│   │   │   ├── footer.tsx      # 공개 사이트 푸터
│   │   │   ├── blog-card.tsx   # 블로그 카드 컴포넌트
│   │   │   ├── cat-icon.tsx    # 커스텀 고양이 SVG 아이콘들
│   │   │   ├── post-renderer.tsx # TipTap 읽기 전용 렌더러 + Mermaid 다이어그램
│   │   │   ├── toast.tsx       # 토스트 알림 시스템
│   │   │   └── admin-nav.tsx   # 관리자 네비게이션
│   │   └── editor/
│   │       ├── tiptap-editor.tsx # TipTap 에디터 (이미지/영상 D&D, 업로드 진행률)
│   │       ├── toolbar.tsx      # 에디터 툴바 (onMouseDown 패턴)
│   │       ├── font-size.ts     # 폰트 크기 커스텀 확장
│   │       └── post-form.tsx    # 글 작성/수정 폼 (이미지 갤러리 포함)
│   ├── lib/
│   │   ├── db.ts               # Prisma 클라이언트 싱글턴
│   │   ├── auth.ts             # JWT 세션 관리 (평문 비밀번호 비교)
│   │   ├── utils.ts            # cn(), generateSlug(), formatDate()
│   │   └── rate-limit.ts       # IP 기반 레이트 리미터
│   └── middleware.ts           # 인증 미들웨어
├── tailwind.config.ts          # 커스텀 색상/그림자/애니메이션
├── next.config.mjs
├── package.json
└── tsconfig.json
```

## Database

### 호스팅
- **Neon** (서버리스 PostgreSQL)
- 연결: connection pooler (ap-southeast-1)
- `prisma db push`로 스키마 반영 (migration 미사용)

### Schema

```
┌──────────────────────┐        ┌──────────────────────┐
│        Post          │        │        Tag           │
├──────────────────────┤        ├──────────────────────┤
│ id        (cuid)  PK │◄──────┤ id       (cuid)   PK │
│ title     (String)   │   1:N │ name     (String)    │
│ slug      (String) U │       │ postId   (String) FK │
│ excerpt   (String)   │       └──────────────────────┘
│ contentJson (Json)   │
│ coverUrl  (String?)  │        PostStatus:
│ images    (String[]) │        - DRAFT
│ status    (Enum)     │        - PUBLISHED
│ publishedAt (DateTime?) │
│ createdAt (DateTime) │
│ updatedAt (DateTime) │
└──────────────────────┘
```

- `contentJson`: TipTap의 ProseMirror JSON 포맷으로 저장
- `slug`: 제목 기반 자동 생성 (한글은 timestamp fallback)
- `images`: 이미지 갤러리 URL 배열
- Tag는 Post에 종속 (cascade delete)

## Authentication Flow

```
[브라우저] → POST /api/auth/login (password)
         → Rate Limit 체크 (IP 기반, 15분/5회)
         → 평문 비밀번호 비교 (ADMIN_PASSWORD)
         → JWT 발급 (HS256, 7일 만료)
         → Set-Cookie: admin_session (httpOnly, secure, sameSite=lax)

[Middleware] → /admin/*, /api/posts (POST/PUT/DELETE), /api/upload
            → Cookie에서 JWT 검증
            → 실패 시: /admin → redirect /admin/login
                       /api   → 401 JSON
```

## Data Flow

### 글 작성/수정
```
PostForm → TipTapEditor → onUpdate (JSONContent) → onChange 콜백
                        → 이미지/영상 D&D → POST /api/upload → URL 반환
        → "저장" 클릭 → DRAFT로 저장
        → "발행" 클릭 → PUBLISHED로 저장
        → POST or PUT /api/posts → Prisma → Neon PostgreSQL
```

### 글 조회
```
[SSR] page.tsx → prisma.post.findMany({ status: "PUBLISHED" })
              → revalidate: 60초 (ISR)
              → BlogCard 또는 PostRenderer 렌더링
              → Mermaid 코드 블록 → SVG 다이어그램 변환 (클라이언트)
```

## File Upload

- **로컬 개발**: `public/uploads/` 디렉토리에 파일 저장 → `/uploads/파일명`으로 접근
- **Vercel 배포**: `BLOB_READ_WRITE_TOKEN` 환경변수 설정 시 Vercel Blob 사용
- 허용: JPEG, PNG, WebP, GIF, MP4, WebM
- 최대 크기: 50MB

## Design System

### Color Palette (Dark Purple Theme)
- **Background**: `dark-950` (#0f0a1e), `dark-975` (#0a0715)
- **Surface**: `surface` (#1a1128) → `raised` (#221738) → `overlay` (#2d1f47)
- **Accent**: Purple (#a78bfa), Pink (#f0abfc), Blue (#93c5fd), Mint (#6ee7b7), Orange (#fdba74)

### Component Classes (globals.css)
- `.btn-primary` / `.btn-secondary` / `.btn-ghost` - 버튼 변형
- `.card` / `.card-raised` - 카드 컨테이너
- `.input-field` - 입력 필드
- `.tag` - 태그 뱃지
- `.article-content` - toss.tech 스타일 아티클 렌더링 + 신택스 하이라이팅

### Animations
- `float` / `float-slow` - 떠다니는 효과
- `fade-in-up` - 페이지 진입 애니메이션
- `pulse-soft` - 부드러운 펄스
- `pawFall` - 고양이 발자국 떨어지는 애니메이션

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | 로그인 (rate limited) |
| DELETE | `/api/auth/login` | No | 로그아웃 |
| GET | `/api/auth/check` | No | 세션 확인 |
| GET | `/api/posts` | Optional | 글 목록 (admin: 전체, public: PUBLISHED) |
| POST | `/api/posts` | Yes | 글 생성 |
| GET | `/api/posts/:id` | Yes | 글 상세 |
| PUT | `/api/posts/:id` | Yes | 글 수정 (images 필드 포함) |
| DELETE | `/api/posts/:id` | Yes | 글 삭제 |
| POST | `/api/upload` | Yes | 파일 업로드 (이미지/영상, 50MB 제한) |

## Environment Variables

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | Neon PostgreSQL 연결 문자열 |
| `SESSION_SECRET` | JWT 서명 비밀키 |
| `ADMIN_PASSWORD` | 관리자 비밀번호 (평문) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 스토리지 토큰 (배포 시 필요) |

## Key Design Decisions

1. **App Router + RSC**: 공개 페이지는 Server Component로 SEO 최적화, ISR 60초
2. **TipTap JSON 저장**: HTML 대신 JSON으로 저장하여 렌더링 유연성 확보
3. **비밀번호만 인증**: 개인 블로그라 단일 비밀번호 인증으로 단순화
4. **Dual Upload**: 로컬 개발은 fs, 배포는 Vercel Blob로 분기
5. **Middleware 인증**: Edge에서 빠른 인증 체크
6. **CodeBlockLowlight**: 코드 블록에 언어별 신택스 하이라이팅 적용
7. **Mermaid 렌더링**: 코드 블록으로 저장 → 렌더링 시 SVG 다이어그램 변환
8. **onMouseDown 패턴**: 툴바 버튼에서 에디터 포커스 유지를 위해 onClick 대신 사용

## 배포 상태

- **GitHub**: joodev 리포지토리 생성 완료
- **Neon DB**: 연결 및 스키마 반영 완료, 로컬 CRUD 검증 완료
- **Vercel**: 배포 예정 (BLOB_READ_WRITE_TOKEN 설정 필요)
