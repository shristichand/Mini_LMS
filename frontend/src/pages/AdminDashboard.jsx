import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/api";

/**
 * Admin dashboard component displaying user progress across all courses
 * @returns {JSX.Element} Admin dashboard JSX
 */
const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["adminUsersWithProgress"],
    queryFn: adminService.getUsersWithProgress,
    staleTime: 60 * 1000, // 1 minute
  });

  const users = data?.users || [];

  return (
    <div className="py-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-gray-700">View student progress across courses.</p>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 text-lg">Loading user progress...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {users.map((user) => (
            <UserProgressCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * User progress card component displaying individual user's course progress
 * @param {Object} props - Component props
 * @param {Object} props.user - User data with progress information
 * @returns {JSX.Element} User progress card JSX
 */
const UserProgressCard = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* User Header with Overall Progress */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-semibold text-gray-900">
            {user.name || user.email}
          </div>
          <div className="text-sm text-gray-600">{user.email}</div>
        </div>
        <div className="w-48">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300" 
              style={{ width: `${user.overallPercentage}%` }} 
            />
          </div>
          <div className="mt-1 text-xs text-gray-600 text-right">
            {user.overallPercentage}% overall
          </div>
        </div>
      </div>

      {/* Course Progress Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {user.courses.map((course) => (
          <CourseProgressItem key={course.courseId} course={course} />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual course progress item component
 * @param {Object} props - Component props
 * @param {Object} props.course - Course progress data
 * @returns {JSX.Element} Course progress item JSX
 */
const CourseProgressItem = ({ course }) => {
  return (
    <div className="border rounded p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-900">{course.title}</div>
        <div className="text-xs text-gray-600">
          {course.completedLessons}/{course.totalLessons}
        </div>
      </div>
      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-600 transition-all duration-300" 
          style={{ width: `${course.percentageCompleted}%` }} 
        />
      </div>
      <div className="mt-1 text-xs text-gray-600 text-right">
        {course.percentageCompleted}%
      </div>
    </div>
  );
};

export default AdminDashboard;
