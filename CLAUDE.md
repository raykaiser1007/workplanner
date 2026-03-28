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
| 4단계 | 리스트 CRUD | 대기 |
| 5단계 | 카드 CRUD | 대기 |
| 6단계 | 드래그앤드롭 (카드/리스트 이동) | 대기 |
| 7단계 | 담당자 지정 | 대기 |
| 8단계 | 마감일 설정 | 대기 |
| 9단계 | 라벨/태그 | 대기 |

## 다음 작업 (재시작 후)
1. Docker Desktop 설치 완료 확인
2. 아래 명령으로 전체 스택 실행:
   ```bash
   cd E:/workspace/workplaner
   docker compose up -d --build
   ```
3. DB 마이그레이션:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```
4. 테스트 계정 생성:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d "{\"loginId\":\"admin\",\"password\":\"1234\",\"name\":\"관리자\"}"
   ```
5. http://localhost:3001 접속하여 로그인 → 대시보드 확인
6. 확인 후 4단계(리스트 CRUD) 진행

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