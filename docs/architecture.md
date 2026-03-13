# JooDev Blog - Architecture

## Overview

JooDev Blog는 Next.js 14 App Router 기반의 풀스택 개인 기술 블로그입니다.
고양이 테마의 다크 퍼플 디자인 시스템을 사용하고, 관리자 패널에서 TipTap 리치 텍스트 에디터로 글을 작성합니다.
Explore 페이지에서는 카테고리별 타임라인 시각화로 글을 탐색할 수 있고, 배경 음악 플레이어도 갖추고 있습니다.

## Tech Stack

| 레이어 | 기술 |
|--------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | React 18 + Tailwind CSS 3.4 |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Editor | TipTap (ProseMirror 기반) |
| Code Highlight | CodeBlockLowlight + lowlight + highlight.js |
| Diagram | Mermaid (코드 블록 -> SVG 렌더링) |
| Auth | JWT (jose) + 평문 비밀번호 비교 |
| Storage | Vercel Blob (배포) / 로컬 fs (개발) |
| Font | Galmuri (sans), JetBrains Mono (mono) |
| VCS | GitHub (joodev) |
| Hosting | Vercel |

## Directory Structure

```
blog/
├── prisma/
│   └── schema.prisma              # DB 스키마 (Post, Tag)
├── public/
│   ├── favicon.svg / favicon.png  # 픽셀 고양이 파비콘
│   ├── fonts/                     # Galmuri 폰트 파일
│   ├── sounds/                    # 배경 음악 + 야옹 효과음
│   └── uploads/                   # 로컬 개발용 이미지 저장
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (html, body, 폰트, 파비콘)
│   │   ├── page.tsx               # /home으로 리다이렉트
│   │   ├── globals.css            # Tailwind + 커스텀 컴포넌트 + 신택스 하이라이팅
│   │   ├── not-found.tsx          # 404 페이지
│   │   ├── (public)/              # 공개 페이지 (Header + Footer 레이아웃)
│   │   │   ├── layout.tsx
│   │   │   ├── home/
│   │   │   │   └── page.tsx       # 랜딩 페이지 (히어로 + 고양이 애니메이션 + 플로팅 태그)
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx       # 블로그 목록 (서버)
│   │   │   │   ├── blog-list-client.tsx  # 목록 클라이언트 필터링
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx   # 게시글 상세
│   │   │   └── explore/
│   │   │       ├── page.tsx       # Explore 페이지 (서버 데이터 페칭)
│   │   │       └── explore-client.tsx  # 타임라인 SVG + 갤러리/리스트 뷰
│   │   ├── admin/                 # 관리자 페이지 (인증 필요)
│   │   │   ├── layout.tsx         # ToastProvider 포함
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # 로그인
│   │   │   └── posts/
│   │   │       ├── page.tsx       # 게시글 목록/관리
│   │   │       ├── new/
│   │   │       │   └── page.tsx   # 새 글 작성
│   │   │       └── [id]/
│   │   │           └── edit/
│   │   │               └── page.tsx # 글 수정
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts   # POST: 로그인 / DELETE: 로그아웃
│   │       │   └── check/
│   │       │       └── route.ts   # GET: 세션 확인
│   │       ├── posts/
│   │       │   ├── route.ts       # GET: 목록 / POST: 생성
│   │       │   └── [id]/
│   │       │       └── route.ts   # GET / PUT / DELETE
│   │       └── upload/
│   │           └── route.ts       # POST: 파일 업로드 (Blob 또는 로컬)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── header.tsx         # 공개 사이트 네비게이션 + 음악 토글
│   │   │   ├── footer.tsx         # 공개 사이트 푸터
│   │   │   ├── blog-card.tsx      # 블로그 카드 컴포넌트
│   │   │   ├── cat-icon.tsx       # 픽셀 고양이 SVG (PixelCat)
│   │   │   ├── paw-fall.tsx       # 발자국 떨어지는 애니메이션
│   │   │   ├── post-renderer.tsx  # TipTap 읽기 전용 렌더러 + Mermaid
│   │   │   ├── post-actions.tsx   # 게시글 액션 버튼
│   │   │   ├── toast.tsx          # 토스트 알림 시스템
│   │   │   ├── admin-nav.tsx      # 관리자 네비게이션
│   │   │   ├── auth-provider.tsx  # 인증 컨텍스트
│   │   │   └── theme-provider.tsx # 테마 토글
│   │   └── editor/
│   │       ├── tiptap-editor.tsx  # TipTap 에디터 (이미지 D&D, 업로드 진행률)
│   │       ├── toolbar.tsx        # 에디터 툴바 (sticky, onMouseDown 패턴)
│   │       ├── post-form.tsx      # 글 작성/수정 폼 (이미지 갤러리, 활동 기간)
│   │       ├── resizable-image.tsx # 이미지 리사이즈 + 갤러리 그룹핑
│   │       ├── font-size.ts       # 폰트 크기 커스텀 확장
│   │       └── line-height.ts     # 줄 간격 커스텀 확장
│   ├── hooks/
│   │   ├── use-music.ts           # 배경 음악 플레이어 (localStorage 기반)
│   │   └── use-meow.ts           # 야옹 효과음 (쿨다운 적용)
│   ├── lib/
│   │   ├── db.ts                  # Prisma 클라이언트 싱글턴
│   │   ├── auth.ts                # JWT 세션 관리
│   │   ├── utils.ts               # cn(), generateSlug(), formatDate(), formatDateRange()
│   │   ├── timeline.ts            # 타임라인 카테고리 설정 (6개 카테고리)
│   │   └── rate-limit.ts          # IP 기반 레이트 리미터
│   └── middleware.ts              # 인증 미들웨어
├── tailwind.config.ts             # 커스텀 색상/그림자/애니메이션
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
┌──────────────────────────┐        ┌──────────────────────────┐
│          Post            │        │          Tag             │
├──────────────────────────┤        ├──────────────────────────┤
│ id          (cuid)    PK │◄──────┤ id         (cuid)     PK │
│ title       (String)     │   1:N │ name       (String)      │
│ slug        (String)   U │       │ postId     (String)   FK │
│ excerpt     (String)     │       └──────────────────────────┘
│ contentJson (Json)       │        @@unique([postId, name])
│ coverUrl    (String?)    │
│ images      (String[])   │        PostStatus:
│ category    (String)     │        - DRAFT
│ status      (Enum)       │        - PUBLISHED
│ publishedAt (DateTime?)  │
│ startDate   (DateTime?)  │  ← 활동 기간 시작일
│ endDate     (DateTime?)  │  ← 활동 기간 종료일
│ createdAt   (DateTime)   │
│ updatedAt   (DateTime)   │
└──────────────────────────┘
```

- `contentJson`: TipTap의 ProseMirror JSON 포맷으로 저장
- `slug`: 제목 기반 자동 생성 (한글은 timestamp fallback)
- `images`: 이미지 갤러리 URL 배열
- `category`: 글 카테고리 (기본값 "Uncategorized"), Explore 타임라인과 연동
- `startDate` / `endDate`: 글 작성 활동 기간 (선택 입력)
- Tag는 Post에 종속 (cascade delete), `(postId, name)` 유니크 제약

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
                        → 이미지 D&D → POST /api/upload → URL 반환
                        → 이미지 리사이즈 + 갤러리 그룹핑
        → 활동 기간 입력 (startDate, endDate)
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

### Explore 타임라인
```
[SSR] explore/page.tsx → 카테고리별 게시글 집계 + 목록 조회
                       → revalidate: 60초
[Client] explore-client.tsx → SVG 베지어 커브 타임라인 렌더링
                            → 카테고리 노드 클릭 → 필터링된 게시글 표시
                            → Daily: 앨범 그리드 / 기타: 카드 리스트
```

## File Upload

- **로컬 개발**: `public/uploads/` 디렉토리에 파일 저장 → `/uploads/파일명`으로 접근
- **Vercel 배포**: `BLOB_READ_WRITE_TOKEN` 환경변수 설정 시 Vercel Blob 사용
- **Vercel 환경에서 로컬 fs 사용 시도 시 에러 반환** (read-only 파일시스템 대응)
- 허용: JPEG, PNG, WebP, GIF, MP4, WebM
- 최대 크기: 50MB
- 파일명: `{timestamp}-{random}.{ext}` 형식

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
| PUT | `/api/posts/:id` | Yes | 글 수정 (images, category, startDate, endDate 포함) |
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
4. **Dual Upload**: 로컬 개발은 fs, 배포는 Vercel Blob로 분기 (Vercel read-only fs 대응)
5. **Middleware 인증**: Edge에서 빠른 인증 체크
6. **CodeBlockLowlight**: 코드 블록에 언어별 신택스 하이라이팅 + `data-language` 뱃지 표시
7. **Mermaid 렌더링**: 코드 블록으로 저장 → 렌더링 시 SVG 다이어그램 변환
8. **onMouseDown 패턴**: 툴바 버튼에서 에디터 포커스 유지를 위해 onClick 대신 사용
9. **Sticky Toolbar**: `sticky top-[57px]`으로 관리자 nav 아래 고정, 반투명 블러 효과
10. **타임라인 카테고리**: 6개 카테고리(Daily/Frontend/Backend/DevOps/QA/Review)로 글 분류 및 시각화

## 배포 상태

- **GitHub**: joodev 리포지토리 운영 중
- **Neon DB**: 연결 및 스키마 반영 완료
- **Vercel**: 배포 완료, Vercel Blob 이미지 업로드 연동
