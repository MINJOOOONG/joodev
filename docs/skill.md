# JooDev Blog - Tech Skills & Stack

이 프로젝트에서 사용된 기술 스택과 각 기술이 어떤 역할을 하는지 정리합니다.

## Frontend

### Next.js 14 (App Router)
- **역할**: 풀스택 React 프레임워크
- **사용 기능**:
  - App Router (파일 기반 라우팅)
  - Server Components (공개 페이지 SSR)
  - Route Handlers (API 엔드포인트)
  - Middleware (인증 가드)
  - ISR (Incremental Static Regeneration, 60초 revalidate)
  - Route Groups: `(public)` 그룹으로 공개 레이아웃 분리
  - Dynamic Routes: `[slug]`, `[id]` 파라미터

### React 18
- **역할**: UI 라이브러리
- **사용 패턴**:
  - `useState`, `useEffect`, `useCallback`, `useRef` 훅
  - `useRouter`, `usePathname`, `useParams` (Next.js 라우터 훅)
  - `dynamic()` import로 에디터 클라이언트 전용 로딩
  - `"use client"` directive로 클라이언트/서버 컴포넌트 분리

### TypeScript
- **역할**: 타입 안전성
- **사용 패턴**:
  - 인터페이스 정의 (`BlogCardProps`, `PostFormProps` 등)
  - 제네릭 (`Promise<Metadata>`, `Promise<{ slug: string }>`)
  - TipTap 커스텀 확장 타입 선언 (`declare module "@tiptap/core"`)

### Tailwind CSS 3.4
- **역할**: 유틸리티 기반 스타일링
- **커스텀 설정**:
  - 다크 퍼플 색상 팔레트 (`dark-*`, `accent-*`, `surface-*`)
  - 커스텀 그림자 (`glow`, `glow-sm`, `card`, `card-hover`)
  - 커스텀 애니메이션 (`float`, `float-slow`, `fade-in-up`)
  - `@layer components`로 재사용 컴포넌트 클래스 정의

## Editor

### TipTap (ProseMirror)
- **역할**: 리치 텍스트 에디터
- **사용 확장**:
  - `StarterKit`: 기본 (bold, italic, headings, lists, code block 등)
  - `Underline`: 밑줄
  - `Link`: 하이퍼링크 (새 탭 옵션)
  - `Image`: 이미지 삽입
  - `Youtube`: YouTube 임베드
  - `TextStyle` + `Color`: 글자 색상
  - `Placeholder`: 플레이스홀더 텍스트
  - `FontSize` (커스텀): 글자 크기 조절
- **구현 패턴**:
  - JSON 포맷으로 콘텐츠 저장/로드
  - 읽기 전용 렌더러 (`editable: false`)
  - 드래그 앤 드롭 이미지/영상 업로드
  - 3초 디바운스 자동 저장
  - XHR 기반 업로드 진행률 표시

## Backend

### Prisma ORM
- **역할**: 데이터베이스 ORM
- **사용 패턴**:
  - 싱글턴 클라이언트 (`global.prisma`)
  - 관계형 쿼리 (`include: { tags: true }`)
  - Cascade Delete (Post 삭제 시 Tag 자동 삭제)
  - `@map()` 으로 snake_case DB 컬럼 매핑
  - `findMany`, `findUnique`, `create`, `update`, `delete`

### PostgreSQL
- **역할**: 관계형 데이터베이스
- **모델**: Post, Tag (1:N 관계)
- **특이사항**: `contentJson`을 `Json` 타입으로 저장 (TipTap ProseMirror 포맷)

### JWT 인증 (jose)
- **역할**: 세션 관리
- **구현**:
  - `HS256` 알고리즘
  - 7일 만료 (`setExpirationTime`)
  - httpOnly 쿠키 저장 (XSS 방지)
  - Middleware에서 Edge Runtime 검증
  - Rate Limiting (IP 기반, 15분/5회)

### Vercel Blob
- **역할**: 파일 스토리지
- **구현**:
  - 이미지 (JPEG, PNG, WebP, GIF) + 영상 (MP4, WebM)
  - 50MB 파일 크기 제한
  - 파일명: `blog/{timestamp}-{random}.{ext}`
  - public access

## Utilities

### clsx
- **역할**: 조건부 className 조합
- **사용**: `cn()` 헬퍼 함수로 래핑

### slugify
- **역할**: URL 슬러그 생성
- **특이사항**: CJK(한글) 문자는 strip되므로 timestamp 기반 fallback

### date-fns
- **역할**: 날짜 포맷팅
- **사용**: `formatDate()` - 한국어 날짜 포맷 (`ko-KR`)

### bcryptjs
- **역할**: 비밀번호 해싱/검증
- **사용**: 환경변수의 해시와 입력 비밀번호 비교

## DevOps

### 주요 스크립트
```bash
npm run dev          # 개발 서버 (next dev)
npm run build        # prisma generate && next build
npm run start        # 프로덕션 서버
npm run db:push      # 스키마를 DB에 반영
npm run db:migrate   # 마이그레이션 생성/적용
npm run db:studio    # Prisma Studio (DB GUI)
npm run db:seed      # 시드 데이터
```

## SVG 아이콘 (커스텀)

프로젝트 전용 고양이 테마 SVG 아이콘을 직접 제작:
- `CatFace`: 로고용 고양이 얼굴 (애니메 스타일 눈)
- `PawPrint`: 발바닥 장식
- `SleepingCat`: 빈 상태(empty state)용 잠자는 고양이
- `HeroCat`: 히어로 섹션 대형 고양이

## 아티클 스타일링 (toss.tech 참고)

글 상세 페이지에서 toss.tech 스타일을 참고한 읽기 경험 제공:
- 넉넉한 줄간격 (line-height: 1.85)
- 충분한 문단 간 여백 (margin-bottom: 24px)
- 코드 블록: 다크 배경 + 라운드 모서리 + 모노스페이스
- 인라인 코드: 보라색 하이라이트
- 인용문: 좌측 보더 + 미세한 배경색
- 리스트: 커스텀 보라색 불릿
- 이미지: 라운드 모서리 + 그림자
- 제목 계층: 큰 상단 마진으로 시각적 섹션 구분
- 최대 너비 680px로 가독성 최적화
