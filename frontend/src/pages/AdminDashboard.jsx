import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/api";

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["adminUsersWithProgress"],
    queryFn: adminService.getUsersWithProgress,
    staleTime: 60 * 1000,
  });

  const users = data?.users || [];

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <p className="text-gray-700 mb-6">View student progress across courses.</p>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-900">{u.name || u.email}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                </div>
                <div className="w-48">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${u.overallPercentage}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-gray-600 text-right">{u.overallPercentage}% overall</div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {u.courses.map((c) => (
                  <div key={c.courseId} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{c.title}</div>
                      <div className="text-xs text-gray-600">{c.completedLessons}/{c.totalLessons}</div>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600" style={{ width: `${c.percentageCompleted}%` }} />
                    </div>
                    <div className="mt-1 text-xs text-gray-600 text-right">{c.percentageCompleted}%</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
