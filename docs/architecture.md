# JooDev Blog - Architecture

## Overview

JooDev Blog는 Next.js 14 App Router 기반의 풀스택 개인 블로그 플랫폼입니다.
고양이 테마의 다크 퍼플 디자인 시스템을 사용하며, 관리자 패널에서 TipTap 리치 텍스트 에디터로 글을 작성하고 관리할 수 있습니다.

## Tech Stack

| 레이어 | 기술 |
|--------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | React 18 + Tailwind CSS 3.4 |
| Database | PostgreSQL + Prisma ORM |
| Editor | TipTap (ProseMirror 기반) |
| Auth | JWT (jose) + bcryptjs |
| Storage | Vercel Blob |
| Font | Inter (sans), JetBrains Mono (mono) |

## Directory Structure

```
blog/
├── prisma/
│   └── schema.prisma          # DB 스키마 (Post, Tag)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (html, body, Inter 폰트)
│   │   ├── globals.css         # Tailwind + 커스텀 컴포넌트 + TipTap 스타일
│   │   ├── not-found.tsx       # 404 페이지
│   │   ├── (public)/           # 공개 페이지 (Header + Footer 레이아웃)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # 홈 (히어로 + 최근 게시글)
│   │   │   └── blog/
│   │   │       ├── page.tsx    # 블로그 목록
│   │   │       └── [slug]/
│   │   │           └── page.tsx # 게시글 상세
│   │   ├── admin/              # 관리자 페이지 (인증 필요)
│   │   │   ├── layout.tsx
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
│   │       │   └── login/
│   │       │       └── route.ts # POST: 로그인 / DELETE: 로그아웃
│   │       ├── posts/
│   │       │   ├── route.ts    # GET: 목록 / POST: 생성
│   │       │   └── [id]/
│   │       │       └── route.ts # GET / PUT / DELETE
│   │       └── upload/
│   │           └── route.ts    # POST: 파일 업로드 (Vercel Blob)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── header.tsx      # 공개 사이트 네비게이션
│   │   │   ├── footer.tsx      # 공개 사이트 푸터
│   │   │   ├── blog-card.tsx   # 블로그 카드 컴포넌트
│   │   │   ├── cat-icon.tsx    # 커스텀 고양이 SVG 아이콘들
│   │   │   ├── post-renderer.tsx # TipTap 읽기 전용 렌더러
│   │   │   └── admin-nav.tsx   # 관리자 네비게이션
│   │   └── editor/
│   │       ├── tiptap-editor.tsx # TipTap 에디터 (이미지/영상 D&D)
│   │       ├── toolbar.tsx      # 에디터 툴바
│   │       ├── font-size.ts     # 폰트 크기 커스텀 확장
│   │       └── post-form.tsx    # 글 작성/수정 폼
│   ├── lib/
│   │   ├── db.ts               # Prisma 클라이언트 싱글턴
│   │   ├── auth.ts             # JWT 세션 관리
│   │   ├── utils.ts            # cn(), generateSlug(), formatDate()
│   │   └── rate-limit.ts       # IP 기반 레이트 리미터
│   └── middleware.ts           # 인증 미들웨어
├── tailwind.config.ts          # 커스텀 색상/그림자/애니메이션
├── next.config.mjs
├── package.json
└── tsconfig.json
```

## Database Schema

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
│ status    (Enum)     │        - DRAFT
│ publishedAt (DateTime?) │     - PUBLISHED
│ createdAt (DateTime) │
│ updatedAt (DateTime) │
└──────────────────────┘
```

- `contentJson`: TipTap의 ProseMirror JSON 포맷으로 저장
- `slug`: 제목 기반 자동 생성 (한글은 timestamp fallback)
- Tag는 Post에 종속 (cascade delete)

## Authentication Flow

```
[브라우저] → POST /api/auth/login (password)
         → Rate Limit 체크 (IP 기반, 15분/5회)
         → bcrypt.compare(password, ADMIN_PASSWORD_HASH)
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
PostForm → TipTapEditor → onUpdate (JSONContent)
                        → 3초 디바운스 → onAutoSave (PUT /api/posts/:id)
                        → 이미지/영상 D&D → POST /api/upload → Vercel Blob URL
        → "발행" 클릭 → POST or PUT /api/posts → Prisma → PostgreSQL
```

### 글 조회
```
[SSR] page.tsx → prisma.post.findMany({ status: "PUBLISHED" })
              → revalidate: 60초 (ISR)
              → BlogCard 또는 PostRenderer 렌더링
```

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
- `.article-content` - toss.tech 스타일 아티클 렌더링

### Animations
- `float` / `float-slow` - 떠다니는 효과
- `fade-in-up` - 페이지 진입 애니메이션
- `pulse-soft` - 부드러운 펄스

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | 로그인 (rate limited) |
| DELETE | `/api/auth/login` | No | 로그아웃 |
| GET | `/api/posts` | Optional | 글 목록 (admin: 전체, public: PUBLISHED) |
| POST | `/api/posts` | Yes | 글 생성 |
| GET | `/api/posts/:id` | Yes | 글 상세 |
| PUT | `/api/posts/:id` | Yes | 글 수정 |
| DELETE | `/api/posts/:id` | Yes | 글 삭제 |
| POST | `/api/upload` | Yes | 파일 업로드 (이미지/영상, 50MB 제한) |

## Environment Variables

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 |
| `SESSION_SECRET` | JWT 서명 비밀키 |
| `ADMIN_PASSWORD_HASH` | bcrypt 해시된 관리자 비밀번호 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 스토리지 토큰 |

## Key Design Decisions

1. **App Router + RSC**: 공개 페이지는 Server Component로 SEO 최적화, ISR 60초
2. **TipTap JSON 저장**: HTML 대신 JSON으로 저장하여 렌더링 유연성 확보
3. **비밀번호만 인증**: 개인 블로그라 단일 비밀번호 인증으로 단순화
4. **Vercel Blob**: 서버리스 환경에 적합한 파일 스토리지
5. **Middleware 인증**: Edge에서 빠른 인증 체크
