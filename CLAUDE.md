# Workplanner - 업무 관리 시스템

## 프로젝트 개요
Trello를 참고한 소규모 팀(10명) 업무 관리 웹 시스템.
폐쇄망(내부망) 환경에서 Docker Compose로 서비스 예정.

## 기술 스택

### Frontend
- React + TypeScript (Vite)
- Tailwind CSS
- @hello-pangea/dnd (드래그앤드롭)
- Zustand (상태관리)

### Backend
- Node.js + Express
- Prisma ORM

### Database
- PostgreSQL

### 인증
- JWT 기반 자체 로그인 (loginId + password)

### 배포
- Docker Compose (폐쇄망 자체 호스팅)

## 디렉토리 구조
```
workplanner/
├── frontend/
│   ├── src/
│   │   ├── components/   # BoardCard, BoardModal, ProtectedRoute
│   │   ├── pages/        # LoginPage, DashboardPage
│   │   ├── store/        # authStore, boardStore
│   │   ├── lib/          # api.ts (fetch 클라이언트)
│   │   └── types/        # index.ts (공통 타입)
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── src/
│   │   ├── middleware/   # auth.ts (JWT 인증)
│   │   ├── routes/       # auth.ts, users.ts, boards.ts
│   │   └── lib/          # prisma.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── CLAUDE.md
```

## 개발 단계

| 단계 | 내용 | 상태 |
|------|------|------|
| 1단계 | 프로젝트 기본 설정 (Frontend + Backend + DB + Docker) | 완료 |
| 2단계 | 인증 (로그인 / 사용자 관리) | 완료 |
| 3단계 | 보드 CRUD | 완료 |
| 4단계 | 리스트 CRUD | 완료 |
| 5단계 | 카드 CRUD | 완료 |
| 6단계 | 드래그앤드롭 (카드/리스트 이동) | 완료 |
| 7단계 | 담당자 지정 | 완료 |
| 8단계 | 마감일 설정 | **다음** |
| 9단계 | 라벨/태그 | 대기 |

## 다음 작업 (재시작 후)
1. Docker Desktop 실행 확인
2. 전체 스택 실행: `docker compose up -d --build`
3. http://localhost:3001 접속 → 로그인 → 보드 클릭 → 담당자 확인
4. 다음: 8단계(마감일 설정) 진행

## 알려진 기술적 이슈 (해결 완료)
- **TypeScript**: `verbatimModuleSyntax` 활성화 → 타입은 반드시 `import type { ... }` 사용
- **Prisma 버전**: `^5.22.0` 고정 (v7은 schema.prisma에서 `url` 제거 등 breaking change 다수)
- **Alpine + Prisma**: backend Dockerfile에 `RUN apk add --no-cache openssl` 필요
- **DB 초기화**: migration 파일 없으므로 `prisma migrate deploy` 대신 `prisma db push` 사용
- **Express params 타입**: `parseInt(req.params.id)` → `parseInt(String(req.params.id))`
- **Prisma update() + _count**: `prisma.update()` 응답에는 `_count` 미포함 → PUT API도 `include: { _count: { select: ... } }` 추가 필요
- **특정 서비스만 재빌드**: `docker compose up -d --build backend` (전체 빌드 불필요 시 활용)

## UI 규칙
- 카드 textarea: `Enter` = 줄바꿈, `Ctrl+Enter` = 제출, `Escape` = 취소

## 포트 설정

| 서비스 | 포트 |
|--------|------|
| Frontend | 3001 |
| Backend | 3000 |
| PostgreSQL | 5432 |
| Vite dev server | 5173 |

## 배포 시 변경 필요 항목
- `frontend/nginx.conf` - `server_name localhost` → 실제 서버 IP 또는 내부 도메인
- `.env` - `DATABASE_URL` host를 실제 서버 IP로 변경

## 개발 원칙
- 기능별 순차 개발 (한 번에 전체 코딩 금지)
- 개발 중 기능 추가/삭제 가능
- 외부 서비스 의존성 최소화 (폐쇄망 환경 고려)

## GitHub
- Repository: https://github.com/raykaiser1007/workplanner.git