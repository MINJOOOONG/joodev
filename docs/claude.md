# JooDev Blog - Claude 개발 가이드

이 문서는 Claude(AI)가 이 프로젝트를 이해하고 효과적으로 작업할 수 있도록 작성된 컨텍스트 문서입니다.

## 프로젝트 개요

- **이름**: JooDev Blog
- **유형**: 개인 기술 블로그 (풀스택)
- **특징**: 고양이 테마 + 다크 퍼플 디자인 시스템
- **작업 디렉토리**: `blog/` (루트가 아닌 blog 하위 디렉토리)
- **DB**: Neon PostgreSQL (Prisma db push 방식)
- **배포**: Vercel 예정

## 핵심 작업 원칙

### 절대 금지
- 불필요한 전면 리팩토링 금지
- 기존 구조를 임의로 변경하지 않기
- 추측 기반 코드 작성 금지 (실제 코드 확인 후 작업)
- build/type check 없이 작업 완료 선언 금지

### 반드시 지켜야 할 것
- 실제 동작 우선 (버튼이 있는지보다 실제로 동작하는지 기준)
- 코드 수정 후 `npx tsc --noEmit` + `npx next build` 검증
- 기존 파일 수정 우선, 새 파일 생성 최소화
- 한 번에 하나씩 문제 해결 후 검증

## 디자인 시스템

### 색상 (다크 테마만 사용)
- 배경: `dark-950`, `dark-975`, `surface`, `surface-raised`, `surface-overlay`
- 보더: `surface-border`, `surface-border-light`
- 텍스트: `gray-200` (기본), `gray-400` (보조), `gray-500`/`gray-600` (약한)
- 강조: `accent-purple`, `accent-pink`, `accent-blue`, `accent-mint`, `accent-orange`
- **금지**: `bg-white`, `bg-gray-50`, `lavender-*`, `cat-*`, `warm` 등 밝은/존재하지 않는 클래스

### 컴포넌트 클래스
- 버튼: `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- 카드: `.card`, `.card-raised`
- 입력: `.input-field`
- 태그: `.tag`
- 아티클: `.article-content` (toss.tech 스타일)

## 코딩 컨벤션

- TypeScript strict 모드
- 함수형 컴포넌트 + 훅
- `"use client"` directive는 상호작용 필요 시에만
- 파일명: kebab-case (`blog-card.tsx`)
- 한국어 UI 텍스트, 영어 코드/변수명
- Tailwind 유틸리티 우선, 복잡한 스타일은 `globals.css`의 `@layer components`

## TipTap 에디터 핵심 패턴

### 툴바 버튼 패턴 (중요!)
```tsx
// ❌ 잘못된 패턴 - onClick은 에디터 포커스를 빼앗음
<button onClick={() => editor.chain().focus().toggleBold().run()}>

// ✅ 올바른 패턴 - onMouseDown + preventDefault로 포커스 유지
<button onMouseDown={(e) => {
  e.preventDefault();
  editor.chain().focus().toggleBold().run();
}}>
```

### 에디터/렌더러 확장 동기화
- `tiptap-editor.tsx`에 추가한 확장은 반드시 `post-renderer.tsx`에도 추가
- CodeBlockLowlight: 에디터와 렌더러 모두에 동일한 lowlight 설정 사용
- Mermaid: 렌더러에서만 SVG 변환 (에디터에서는 코드 블록으로 표시)

### 콘텐츠 저장 형식
- 항상 `JSONContent` (ProseMirror JSON) 형태
- `editor.getJSON()` → DB 저장 → `PostRenderer`에서 읽기 전용 렌더링

## 파일 업로드

- 개발: 로컬 fs (`public/uploads/`) — BLOB_READ_WRITE_TOKEN 없을 때
- 배포: Vercel Blob — BLOB_READ_WRITE_TOKEN 있을 때
- 허용: JPEG, PNG, WebP, GIF, MP4, WebM
- 최대: 50MB

## 환경 변수

```
DATABASE_URL=postgresql://...@neon.tech/neondb?sslmode=require
SESSION_SECRET=<랜덤 문자열>
ADMIN_PASSWORD=<평문 비밀번호>
BLOB_READ_WRITE_TOKEN=<Vercel Blob 토큰, 배포 시 필요>
```

## 자주 하는 작업

### 에디터 확장 추가
1. TipTap 확장 패키지 설치
2. `tiptap-editor.tsx`의 `extensions` 배열에 추가
3. `post-renderer.tsx`에도 동일하게 추가
4. 필요 시 `toolbar.tsx`에 버튼 추가 (onMouseDown 패턴!)

### 새 API 엔드포인트
1. `src/app/api/` 아래에 route.ts 생성
2. 인증 필요 시 `middleware.ts`의 matcher에 경로 추가

## 알려진 이슈

1. **한글 슬러그**: slugify가 한글을 strip → timestamp fallback
2. **Rate Limit**: 인메모리 → 서버 재시작 시 초기화
3. **비밀번호**: 평문 비교 사용 중 (bcrypt 미적용)
