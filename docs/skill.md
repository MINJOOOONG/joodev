# JooDev Blog - 기능 현황

프로젝트에서 구현한 기능들을 정리한 문서입니다.
개발 과정에서 겪은 이슈와 앞으로 개선할 점도 함께 기록합니다.

---

## 구현 완료

### 인증 시스템
- 단일 비밀번호 로그인 (평문 비교)
- JWT 세션 (HS256, 7일 만료, httpOnly 쿠키)
- Middleware 기반 인증 가드
- IP 기반 Rate Limiting (15분/5회)

### 글 관리 (CRUD)
- 글 목록 조회 (관리자: 전체, 공개: PUBLISHED만)
- 글 작성 (제목, 요약, 본문, 태그, 카테고리, 이미지 갤러리, 활동 기간)
- 글 수정 (동일 폼, images/category/startDate/endDate 필드 포함)
- 글 삭제 (관리자 목록에서)
- 슬러그 자동 생성 (한글 fallback)
- DRAFT / PUBLISHED 상태 관리
- 카테고리 분류 (Daily, Frontend, Backend, DevOps, QA, Review)
- 활동 기간 입력 (시작일/종료일, 선택 사항)

### 파일 업로드
- 이미지 (JPEG, PNG, WebP, GIF) + 영상 (MP4, WebM)
- 50MB 파일 크기 제한
- 로컬 개발: `public/uploads/`에 파일 저장
- 배포: Vercel Blob 사용 (BLOB_READ_WRITE_TOKEN 필요)
- Vercel read-only 파일시스템 감지 및 에러 처리
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
- 이미지 리사이즈 (드래그 핸들 + 25/50/75/100% 프리셋)
- 이미지 갤러리 그룹핑 (드래그로 최대 3장 묶음, 분리 가능)
- 이미지 캡션 입력
- YouTube 임베드 (URL 입력, 글 당 최대 5개)
- 코드 블록 (JavaScript, TypeScript, Java, Python, Bash, HTML, Mermaid 언어 선택)
- 코드 블록 언어 뱃지 표시 (`data-language` 속성)
- 신택스 하이라이팅 (lowlight + highlight.js)
- Placeholder 텍스트
- 키보드 단축키 지원 (Ctrl+B, Ctrl+I, Ctrl+U 등)
- 툴바 버튼 단축키 툴팁 표시
- **Sticky 툴바** (`sticky top-[57px]`, 반투명 블러 효과)
- 툴바 버튼 onMouseDown 패턴 적용 (에디터 포커스 유지)
- 코드 블록 삽입 후 빈 문단 자동 추가 (이어서 글쓰기 가능)

### 글 렌더링
- TipTap 읽기 전용 렌더러 (PostRenderer)
- toss.tech 스타일 아티클 렌더링 (.article-content)
- 코드 블록 언어 뱃지 표시
- 신택스 하이라이팅 (다크 테마)
- Mermaid 다이어그램 자동 렌더링 (코드 블록 -> SVG)
- YouTube 임베드 반응형 표시
- 이미지 갤러리 그리드 렌더링 (2장: 50%, 3장: 33.3%)

### Explore 페이지
- 카테고리별 타임라인 시각화 (SVG 베지어 커브, 네온 글로우)
- 6개 카테고리 노드 (Daily/Frontend/Backend/DevOps/QA/Review)
- 노드 호버 시 카테고리 설명 툴팁
- 카테고리 탭 버튼으로 필터링 (전체 + 각 카테고리, 개수 표시)
- Daily 카테고리: 앨범 그리드 뷰 (커버 이미지 기반)
- 기타 카테고리: 카드 리스트 뷰 (썸네일 포함)
- 활동 기간 날짜 범위 표시 (formatDateRange)
- 카테고리 선택 시 게시글 영역으로 스무스 스크롤
- 서버 사이드 데이터 페칭 + ISR 60초

### 음악 플레이어
- 배경 음악 재생 (루프, 0.3 볼륨)
- localStorage 기반 재생 상태 유지
- 헤더의 PixelCat 아이콘 클릭으로 토글
- Play/Stop 말풍선 UI (재생 중: 보라색, 정지: 기본)
- 야옹 효과음 (쿨다운 적용)

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
- 랜딩 페이지 (히어로 + 고양이 애니메이션 + 플로팅 태그)
- 블로그 목록 페이지 (카드 그리드 + 클라이언트 필터링)
- 글 상세 페이지 (아티클 렌더링)
- Explore 페이지 (타임라인 + 카테고리별 글 탐색)
- 404 페이지

### 디자인 시스템
- 다크 퍼플 테마 (전체 적용)
- 픽셀 고양이 파비콘 (SVG + PNG)
- 픽셀 고양이 아이콘 (PixelCat 컴포넌트)
- 발자국 떨어지는 애니메이션 (paw-fall)
- 커스텀 컴포넌트 클래스 (btn, card, input-field, tag)

### 인프라 / 배포
- GitHub 리포지토리 (joodev) 운영 중
- Neon PostgreSQL 연결 완료
- Prisma db push 완료
- Vercel 배포 완료
- Vercel Blob 이미지 업로드 연동 완료
- Docker 의존성 제거 상태

---

## 문제 해결 과정

### Vercel 배포 시 이미지 업로드 이슈
Vercel의 서버리스 환경은 read-only 파일시스템이라 로컬 fs에 파일을 쓸 수 없었습니다.
`BLOB_READ_WRITE_TOKEN` 환경변수 유무로 Vercel Blob과 로컬 fs를 분기 처리하고,
Vercel 환경에서 토큰 없이 업로드 시도 시 명확한 에러 메시지를 반환하도록 수정했습니다.

### 에디터 툴바 포커스 유실
TipTap 에디터에서 툴바 버튼을 `onClick`으로 처리하면 에디터의 포커스가 풀리는 문제가 있었습니다.
`onMouseDown` + `e.preventDefault()` 패턴으로 전환하여 포커스를 유지하도록 해결했습니다.
드롭다운 항목들도 동일 패턴을 적용했습니다.

### 영상 직접 업로드 제거
영상 파일 직접 업로드 기능을 제거하고 YouTube 임베드로 통일했습니다.
글 당 YouTube 임베드는 최대 5개로 제한합니다.

### 이미지 드래그 앤 드롭 개선
에디터 내 이미지 드래그 시 의도치 않은 동작이 발생하는 문제를 개선했습니다.
이미지를 다른 이미지 위에 드래그하면 갤러리로 묶이고(최대 3장),
리사이즈 핸들과 사이즈 프리셋 버튼으로 크기 조절이 가능합니다.

---

## 미구현 (추후 검토)

### 에디터 추가 기능
- 태그 칩 UI (현재: 쉼표 구분 텍스트 입력)
- 이미지 갤러리 드래그 정렬 (글 작성 폼의 갤러리)
- 글 버전 히스토리

### 보안 강화
- bcrypt 비밀번호 해싱 (현재: 평문 비교)

### 기타
- SEO 최적화 (메타 태그, OG 이미지)
- RSS 피드
- 검색 기능

---

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
  - LineHeight (커스텀 확장)
  - Placeholder
- **ResizableImage** (커스텀 노드뷰: 리사이즈, 캡션, 갤러리 그룹핑)
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
- clsx -> `cn()` 헬퍼
- slugify (CJK fallback)
- date-fns (한국어 날짜 포맷)
- `formatDateRange()` (활동 기간 표시)
- `timeline.ts` (6개 카테고리 설정 + 색상/아이콘 매핑)
