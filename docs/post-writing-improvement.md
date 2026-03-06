# 글 작성 페이지 개선 기획서

## 현재 상태 요약

글 작성(`/admin/posts/new`)과 수정(`/admin/posts/[id]/edit`) 페이지가 존재하지만,
실제로 사용해보면 **이미지 업로드 실패**, **데이터 누락**, **UX 부재** 등 여러 문제가 있다.

---

## 1. 크리티컬 버그 (당장 고쳐야 하는 것)

### 1-1. 이미지 업로드 완전히 깨짐

**현상**: 이미지 업로드 시 500 에러 발생

**원인**: `upload/route.ts`가 `@vercel/blob`의 `put()`을 사용하는데,
`.env`의 `BLOB_READ_WRITE_TOKEN`이 빈 문자열이다.

```
BLOB_READ_WRITE_TOKEN=""   ← 비어있음
```

**해결 방안**:
- 로컬 개발 환경에서는 Vercel Blob 대신 **로컬 파일 시스템 저장** 방식으로 전환
- `public/uploads/` 디렉토리에 파일을 저장하고 `/uploads/파일명`으로 접근
- 배포 시에만 Vercel Blob 사용하도록 분기 처리

```
수정 파일: src/app/api/upload/route.ts
```

### 1-2. PUT API에서 images 필드 누락

**현상**: 글 수정 시 이미지 갤러리 데이터가 저장되지 않음

**원인**: `api/posts/[id]/route.ts`의 PUT 핸들러에서 `body`에서 `images`를 추출하지 않고,
`prisma.post.update()`의 `data`에도 `images` 필드가 빠져 있다.

```typescript
// 현재 코드 (line 31)
const { title, excerpt, contentJson, coverUrl, status, tags } = body;
//                                            ↑ images 빠짐
```

**해결**: `images` 필드를 추출하고 update data에 포함

```
수정 파일: src/app/api/posts/[id]/route.ts
```

---

## 2. UX 개선 (사용성 문제)

### 2-1. 제목 미입력 시 무방비 저장

**현상**: 제목 없이 "발행" 버튼을 누르면 그대로 API 호출 → 400 에러 → `alert()`

**개선**:
- 클라이언트에서 제목 필수 검증
- 발행 시 최소 조건 체크 (제목 + 본문 내용 존재)
- `alert()` 대신 인라인 에러 메시지 표시

```
수정 파일: src/components/editor/post-form.tsx
```

### 2-2. 페이지 이탈 시 미저장 경고 없음

**현상**: 글 작성 중 뒤로가기/페이지 이동 시 내용이 그냥 날아감

**개선**:
- `beforeunload` 이벤트로 브라우저 이탈 경고
- Next.js 라우터 이동 시에도 확인 다이얼로그

```
수정 파일: src/components/editor/post-form.tsx
```

### 2-3. 새 글 작성 시 자동저장 미동작

**현상**: `isEdit`이 false일 때 `handleAutoSave`가 `return`으로 빠져나감.
새 글을 열심히 쓰다가 브라우저가 꺼지면 다 날아감.

**개선 방안 (2가지 중 택 1)**:
- **A안**: 새 글도 첫 자동저장 시 DRAFT로 자동 생성 후 edit 모드로 전환
- **B안**: localStorage에 임시저장 → 다음 접속 시 복원 제안

```
수정 파일: src/components/editor/post-form.tsx
```

### 2-4. 저장 버튼 피드백 부족

**현상**: "저장 중..." 텍스트만 잠깐 보이고 성공/실패 구분이 어려움

**개선**:
- 토스트 알림 컴포넌트 추가 (성공: 초록, 실패: 빨강)
- 저장 완료 시 체크마크 애니메이션
- 네트워크 에러 시 재시도 옵션

```
신규 파일: src/components/ui/toast.tsx
수정 파일: src/components/editor/post-form.tsx
```

---

## 3. 에디터 기능 개선

### 3-1. 에디터 내 이미지 삽입도 깨짐

**현상**: 툴바의 이미지/영상 업로드 버튼도 동일하게 `/api/upload` 호출 → 실패

**해결**: 1-1의 업로드 API 수정으로 함께 해결됨

### 3-2. 코드 블록 언어 선택 불가

**현상**: 코드 블록 삽입 시 언어 지정을 못해서 신택스 하이라이팅이 안 됨

**개선**:
- 코드 블록 삽입 시 언어 선택 드롭다운 추가
- `lowlight` 기반 신택스 하이라이팅 적용

```
신규 의존성: @tiptap/extension-code-block-lowlight, lowlight
수정 파일: src/components/editor/tiptap-editor.tsx, toolbar.tsx
```

### 3-3. 에디터 키보드 단축키 안내 없음

**현상**: Tiptap이 기본 단축키(Ctrl+B 등)를 지원하지만 사용자가 알 수 없음

**개선**:
- 툴바 버튼에 툴팁으로 단축키 표시 (예: "굵게 (Ctrl+B)")
- 또는 에디터 하단에 단축키 안내 토글

```
수정 파일: src/components/editor/toolbar.tsx
```

---

## 4. 태그 시스템 개선

### 4-1. 쉼표 구분 입력 → 칩(Chip) UI로 변경

**현상**: 태그를 쉼표로 구분해서 텍스트로 입력하는 방식 → 직관적이지 않음

**개선**:
- 태그 입력 시 Enter/쉼표로 칩 생성
- 칩 클릭으로 삭제
- 기존 태그 자동완성 (DB에서 사용된 태그 목록 조회)

```
신규 파일: src/components/editor/tag-input.tsx
신규 API: GET /api/tags (기존 태그 목록 반환)
수정 파일: src/components/editor/post-form.tsx
```

---

## 5. 이미지 갤러리 개선

### 5-1. 이미지 순서 변경 불가

**현상**: 업로드한 순서대로 고정 → 순서 변경 불가

**개선**:
- 드래그 앤 드롭으로 이미지 순서 변경

```
신규 의존성: @dnd-kit/core, @dnd-kit/sortable
수정 파일: src/components/editor/post-form.tsx
```

### 5-2. 이미지 업로드 진행률 표시 없음 (갤러리)

**현상**: 갤러리 이미지 업로드 시 "업로드 중..." 텍스트만 나옴

**개선**:
- 각 이미지별 업로드 진행률 표시
- 썸네일 프리뷰를 먼저 보여주고 업로드 완료 후 실제 URL로 교체

```
수정 파일: src/components/editor/post-form.tsx
```

---

## 6. 임시저장 / 버전 관리

### 6-1. 글 히스토리 기능

**현상**: 수정 시 이전 버전을 확인하거나 되돌릴 수 없음

**개선 (선택사항)**:
- PostVersion 모델 추가
- 저장 시마다 이전 버전 스냅샷 저장
- "이전 버전 보기" UI 추가

```
수정 파일: prisma/schema.prisma (PostVersion 모델 추가)
신규 API: GET /api/posts/[id]/versions
```

---

## 우선순위별 구현 로드맵

### Phase 1 - 핵심 버그 수정 (필수)
| # | 작업 | 파일 | 난이도 |
|---|------|------|--------|
| 1 | 로컬 파일 업로드 API로 전환 | `api/upload/route.ts` | ★★☆ |
| 2 | PUT API에 images 필드 추가 | `api/posts/[id]/route.ts` | ★☆☆ |
| 3 | 제목 필수 검증 추가 | `post-form.tsx` | ★☆☆ |

### Phase 2 - 기본 UX 개선 (권장)
| # | 작업 | 파일 | 난이도 |
|---|------|------|--------|
| 4 | 토스트 알림 시스템 | `toast.tsx`, `post-form.tsx` | ★★☆ |
| 5 | 미저장 이탈 경고 | `post-form.tsx` | ★☆☆ |
| 6 | 새 글 자동저장 (DRAFT 자동 생성) | `post-form.tsx` | ★★☆ |
| 7 | 태그 칩 UI | `tag-input.tsx`, `post-form.tsx` | ★★☆ |

### Phase 3 - 에디터 강화 (선택)
| # | 작업 | 파일 | 난이도 |
|---|------|------|--------|
| 8 | 코드 블록 언어 선택 + 하이라이팅 | `tiptap-editor.tsx`, `toolbar.tsx` | ★★★ |
| 9 | 이미지 갤러리 드래그 정렬 | `post-form.tsx` | ★★☆ |
| 10 | 이미지 업로드 진행률 (갤러리) | `post-form.tsx` | ★★☆ |
| 11 | 키보드 단축키 툴팁 | `toolbar.tsx` | ★☆☆ |

### Phase 4 - 고급 기능 (나중에)
| # | 작업 | 파일 | 난이도 |
|---|------|------|--------|
| 12 | 글 버전 히스토리 | `schema.prisma`, 신규 API/UI | ★★★ |

---

## 참고: 현재 파일 구조

```
src/
├── app/
│   ├── admin/posts/
│   │   ├── new/page.tsx          ← 새 글 작성 진입점
│   │   └── [id]/edit/page.tsx    ← 글 수정 진입점
│   └── api/
│       ├── posts/
│       │   ├── route.ts          ← GET(목록), POST(생성)
│       │   └── [id]/route.ts     ← GET/PUT/DELETE
│       └── upload/route.ts       ← 파일 업로드
├── components/editor/
│   ├── post-form.tsx             ← 메인 폼 (핵심)
│   ├── tiptap-editor.tsx         ← 리치 텍스트 에디터
│   ├── toolbar.tsx               ← 에디터 툴바
│   └── font-size.ts              ← 폰트 사이즈 익스텐션
└── lib/
    ├── auth.ts                   ← 인증 (평문 비교 버그 있음)
    └── db.ts                     ← Prisma 클라이언트
```
