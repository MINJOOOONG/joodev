# 글 작성 페이지 - 개선 현황

## 완료된 작업

### 크리티컬 버그 수정
- [x] 이미지 업로드 API: 로컬 fs / Vercel Blob 분기 처리 완료
- [x] PUT API에 images 필드 추가 완료
- [x] 제목 필수 검증 추가 완료
- [x] 발행 시 본문 내용 존재 검증 추가

### UX 개선
- [x] 토스트 알림 시스템 구현 (success/error/info)
- [x] alert() → toast() 전환 완료
- [x] 미저장 이탈 경고 (beforeunload) 구현
- [x] dirty state 추적 (변경사항 있음 표시)
- [x] 에디터 업로드 진행률 표시 (XHR progress bar)

### 에디터 기능
- [x] 코드 블록 언어 선택 (Java / HTML / Mermaid) 드롭다운
- [x] 신택스 하이라이팅 (CodeBlockLowlight + lowlight + highlight.js)
- [x] Mermaid 다이어그램 렌더링 (글 상세 페이지)
- [x] YouTube 임베드 (URL 입력, 글 당 1개 제한)
- [x] 하이퍼링크 (URL + 새 창 옵션 + 제거)
- [x] 툴바 단축키 툴팁 표시

### 툴바 포커스 문제 해결
- [x] onClick → onMouseDown + e.preventDefault() 패턴 전환
- [x] 드롭다운 항목들도 동일 패턴 적용
- [x] 코드 블록 삽입 후 빈 문단 자동 추가 (이어서 글쓰기 가능)

### 방향 변경 사항
- [x] 자동저장(auto-save) 기능 제거
- [x] 프리뷰 모드 제거
- [x] 글 저장은 "저장"(DRAFT) + "발행"(PUBLISHED) 2버튼 방식

## 브라우저 검증 필요

- [ ] Bold, Italic, Underline, Strike 실제 동작 확인
- [ ] H2, H3 제목 토글 동작 확인
- [ ] 하이퍼링크 적용/제거 동작 확인
- [ ] 코드 블록 삽입 + 이어서 글쓰기 확인
- [ ] YouTube 임베드 삽입 + 1개 제한 확인
- [ ] 글자 크기, 색상 드롭다운 동작 확인

## 추후 개선 (미구현)

### 태그 시스템
- [ ] 쉼표 구분 텍스트 → 칩(Chip) UI
- [ ] Enter/쉼표로 칩 생성, 클릭 삭제
- [ ] 기존 태그 자동완성

### 이미지 갤러리
- [ ] 드래그 앤 드롭 순서 변경
- [ ] 갤러리 이미지별 업로드 진행률

### 고급 기능
- [ ] 글 버전 히스토리 (PostVersion 모델)
- [ ] 이전 버전 보기/복원

## 현재 에디터 확장 목록

| 확장 | 용도 | 에디터 | 렌더러 |
|------|------|--------|--------|
| StarterKit | 기본 (bold, italic, headings 등) | O | O |
| CodeBlockLowlight | 코드 블록 + 하이라이팅 | O | O |
| Underline | 밑줄 | O | O |
| Link | 하이퍼링크 | O | O |
| Image | 이미지 삽입 | O | O |
| Youtube | YouTube 임베드 | O | O |
| TextStyle | 텍스트 스타일 기반 | O | O |
| Color | 글자 색상 | O | O |
| FontSize | 글자 크기 (커스텀) | O | - |
| Placeholder | 빈 상태 안내 텍스트 | O | - |
| Mermaid | 다이어그램 렌더링 | - | O (DOM) |
