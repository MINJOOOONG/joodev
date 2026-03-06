# JooDev Blog - Claude 개발 가이드

이 문서는 Claude(AI)가 이 프로젝트를 이해하고 효과적으로 작업할 수 있도록 작성된 컨텍스트 문서입니다.

## 프로젝트 개요

- **이름**: JooDev Blog
- **유형**: 개인 개발 블로그 (풀스택)
- **특징**: 고양이 테마 + 다크 퍼플 디자인 시스템
- **작업 디렉토리**: `blog/` (루트가 아닌 blog 하위 디렉토리)

## 핵심 규칙

### 디자인 시스템
- **반드시 다크 테마** 사용 (밝은 배경 사용 금지)
- 색상은 `tailwind.config.ts`에 정의된 커스텀 색상만 사용:
  - 배경: `dark-950`, `dark-975`, `surface`, `surface-raised`, `surface-overlay`
  - 보더: `surface-border`, `surface-border-light`
  - 텍스트: `gray-200` (기본), `gray-400` (보조), `gray-500`/`gray-600` (약한)
  - 강조: `accent-purple`, `accent-pink`, `accent-blue`, `accent-mint`, `accent-orange`
- `lavender-*`, `cat-*`, `warm` 등의 클래스는 **존재하지 않음** (이전 디자인 잔여물)
- 밝은 배경 (`bg-white`, `bg-gray-50` 등) 사용 금지

### 컴포넌트 클래스
- 버튼: `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- 카드: `.card`, `.card-raised`
- 입력: `.input-field`
- 태그: `.tag`
- 아티클 렌더링: `.article-content` (toss.tech 스타일)

### 다크 테마 적용 완료
- 모든 공개 페이지 및 관리자 페이지에 다크 테마 적용 완료
- `lavender-*`, `cat-*`, `warm`, `bg-white` 등 이전 라이트 테마 색상 전부 제거됨

### 코딩 컨벤션
- TypeScript strict 모드
- 함수형 컴포넌트 + 훅 (클래스 컴포넌트 사용 안 함)
- `"use client"` directive는 상호작용이 필요한 컴포넌트에만
- Next.js App Router 패턴 준수
- 파일명: kebab-case (`blog-card.tsx`)
- CSS: Tailwind 유틸리티 우선, 복잡한 스타일은 `globals.css`에 `@layer components`
- 한국어 UI 텍스트 사용 (코드/변수명은 영어)

### API 패턴
- Route Handlers (`route.ts`)에서 `NextRequest`/`NextResponse` 사용
- 에러 응답: `{ error: "메시지" }` 형태
- 인증: 미들웨어에서 JWT 검증 (에디터에서 별도 체크 불필요)

### TipTap 에디터
- 콘텐츠는 항상 `JSONContent` (ProseMirror JSON) 형태로 저장
- `PostRenderer`는 읽기 전용 TipTap 인스턴스 (`editable: false`)
- 글 상세 페이지에서 `.article-content` 클래스로 toss.tech 스타일 적용
- 에디터에서는 `.tiptap` 클래스 스타일 적용

### 파일 업로드
- Vercel Blob 사용 (`@vercel/blob`)
- 허용 타입: JPEG, PNG, WebP, GIF, MP4, WebM
- 최대 크기: 50MB
- 에디터 내 드래그 앤 드롭 지원

## 자주 하는 작업 가이드

### 새 공개 페이지 추가
1. `src/app/(public)/` 아래에 폴더/page.tsx 생성
2. Server Component 사용 (클라이언트 상호작용 필요 시 별도 컴포넌트 분리)
3. 다크 테마 색상 사용

### 새 API 엔드포인트 추가
1. `src/app/api/` 아래에 route.ts 생성
2. 인증이 필요하면 `middleware.ts`의 `matcher`에 경로 추가
3. 에러 처리 패턴 준수

### 에디터 확장 추가
1. TipTap 확장 패키지 설치
2. `tiptap-editor.tsx`의 `extensions` 배열에 추가
3. `post-renderer.tsx`에도 동일하게 추가 (읽기 전용)
4. 필요 시 `toolbar.tsx`에 버튼 추가

### 디자인 요소 추가
1. 새 색상/그림자 → `tailwind.config.ts`에 추가
2. 재사용 컴포넌트 스타일 → `globals.css`의 `@layer components`
3. 아이콘 → `cat-icon.tsx`에 새 SVG 컴포넌트 추가

## 환경 변수 (.env)

```
DATABASE_URL=postgresql://...
SESSION_SECRET=<랜덤 문자열>
ADMIN_PASSWORD_HASH=<bcrypt 해시>
BLOB_READ_WRITE_TOKEN=<Vercel Blob 토큰>
```

## 실행 방법

```bash
cd blog
npm install
npm run db:push    # DB 스키마 반영
npm run dev        # http://localhost:3000
```

## 알려진 이슈

1. **한글 슬러그**: `slugify`가 한글을 strip하므로 timestamp 기반 fallback 사용
2. **Rate Limit**: 인메모리 방식이라 서버 재시작 시 초기화됨
