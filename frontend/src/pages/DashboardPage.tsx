import { useAuthStore } from '../store/authStore'

export default function DashboardPage() {
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Workplanner</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>
      <main className="p-6">
        <p className="text-gray-500">보드 목록이 여기에 표시됩니다.</p>
      </main>
    </div>
  )
}
