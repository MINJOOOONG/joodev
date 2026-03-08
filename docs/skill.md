# JooDev Blog - 기능 현황

이 문서는 프로젝트의 기능별 구현 상태를 정리합니다.

## 구현 완료

### 인증 시스템
- 단일 비밀번호 로그인 (평문 비교)
- JWT 세션 (HS256, 7일 만료, httpOnly 쿠키)
- Middleware 기반 인증 가드
- IP 기반 Rate Limiting (15분/5회)

### 글 관리 (CRUD)
- 글 목록 조회 (관리자: 전체, 공개: PUBLISHED만)
- 글 작성 (제목, 요약, 본문, 태그, 이미지 갤러리)
- 글 수정 (동일 폼, images 필드 포함)
- 글 삭제 (관리자 목록에서)
- 슬러그 자동 생성 (한글 fallback)
- DRAFT / PUBLISHED 상태 관리

### 파일 업로드
- 이미지 (JPEG, PNG, WebP, GIF) + 영상 (MP4, WebM)
- 50MB 파일 크기 제한
- 로컬 개발: `public/uploads/`에 파일 저장
- 배포: Vercel Blob 사용 (BLOB_READ_WRITE_TOKEN 필요)
- 에디터 내 드래그 앤 드롭 업로드
- XHR 기반 업로드 진행률 표시

### 에디터 (TipTap)
- 기본 서식: Bold, Italic, Underline, Strike
- 제목: H2, H3
- 목록: 불릿 리스트, 숫자 리스트
- 인용문 (Blockquote)
- 구분선 (Horizontal Rule)
- 하이퍼링크 (URL 입력, 새 창 옵션, 링크 제거)
- 글자 크기 조절 (12~32px)
- 글자 색상 (10색 팔레트)
- 이미지 업로드 (에디터 내 삽입)
- 영상 업로드 (에디터 내 삽입)
- YouTube 임베드 (URL 입력, 글 당 1개 제한)
- 코드 블록 (Java / HTML / Mermaid 언어 선택)
- 신택스 하이라이팅 (lowlight + highlight.js)
- Placeholder 텍스트
- 키보드 단축키 지원 (Ctrl+B, Ctrl+I, Ctrl+U 등)
- 툴바 버튼 단축키 툴팁 표시

### 글 렌더링
- TipTap 읽기 전용 렌더러 (PostRenderer)
- toss.tech 스타일 아티클 렌더링 (.article-content)
- 코드 블록 언어 라벨 표시 (pre::before)
- 신택스 하이라이팅 (다크 테마)
- Mermaid 다이어그램 자동 렌더링 (코드 블록 → SVG)
- YouTube 임베드 반응형 표시

### 이미지 갤러리 (글 작성 폼)
- 이미지 업로드 (최대 10장)
- 커버 이미지 선택 (클릭)
- 이미지 삭제
- 업로드 제한 toast 알림

### 토스트 알림
- Context 기반 글로벌 토스트 시스템
- success / error / info 타입
- 3초 자동 닫힘, 클릭 닫힘

### 공개 페이지
- 랜딩 페이지 (히어로 + 최근 게시글 + 고양이 애니메이션)
- 블로그 목록 페이지 (카드 그리드)
- 글 상세 페이지 (아티클 렌더링)
- 404 페이지

### 디자인 시스템
- 다크 퍼플 테마 (전체 적용)
- 고양이 테마 SVG 아이콘 (CatFace, PawPrint, SleepingCat, HeroCat)
- 커스텀 컴포넌트 클래스 (btn, card, input-field, tag)
- 떠다니는 발자국 애니메이션 (paw-snow)

### 인프라
- GitHub 리포지토리 (joodev) 생성 완료
- Neon PostgreSQL 연결 완료
- Prisma db push 완료
- 로컬 CRUD 검증 완료
- Docker 의존성 제거 상태

## 구현 중 (진행 중)

### 에디터 고도화
- 툴바 버튼 onMouseDown 패턴 적용 (포커스 유지) → 적용 완료, 브라우저 검증 필요
- 코드 블록 삽입 후 이어서 글쓰기 UX → 구현 완료, 검증 필요

### Vercel 배포 준비
- Vercel 프로젝트 생성 필요
- BLOB_READ_WRITE_TOKEN 발급 필요
- 환경변수 설정 필요

## 미구현 (추후 검토)

### 에디터 추가 기능
- 태그 칩 UI (현재: 쉼표 구분 텍스트 입력)
- 이미지 갤러리 드래그 정렬
- 이미지 업로드 진행률 (갤러리)
- 글 버전 히스토리

### 보안 강화
- bcrypt 비밀번호 해싱 (현재: 평문 비교)

### 기타
- SEO 최적화 (메타 태그, OG 이미지)
- RSS 피드
- 검색 기능

## 기술 스택 상세

### Frontend
- **Next.js 14** (App Router, SSR/ISR, Route Handlers, Middleware)
- **React 18** (hooks, dynamic import, client/server 분리)
- **TypeScript** (strict mode)
- **Tailwind CSS 3.4** (커스텀 다크 퍼플 테마)

### Editor
- **TipTap** (ProseMirror 기반)
  - StarterKit (codeBlock 제외)
  - CodeBlockLowlight (lowlight + highlight.js)
  - Underline, Link, Image, Youtube
  - TextStyle + Color
  - FontSize (커스텀 확장)
  - Placeholder
- **Mermaid** (다이어그램 렌더링, 읽기 전용)

### Backend
- **Prisma ORM** (싱글턴 클라이언트, 관계형 쿼리, cascade delete)
- **PostgreSQL (Neon)** (서버리스, connection pooler)
- **JWT (jose)** (HS256, Edge Runtime 호환)
- **Rate Limiter** (인메모리, IP 기반)

### Storage
- **Vercel Blob** (배포용 파일 스토리지)
- **로컬 fs** (개발용 `public/uploads/`)

### Utilities
- clsx → `cn()` 헬퍼
- slugify (CJK fallback)
- date-fns (한국어 날짜 포맷)
