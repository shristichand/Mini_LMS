import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useLogout, useIsAuthenticated } from '../hooks/authHook';
import { useCourses } from '../hooks/coursesHook';
import { getFileUrl } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const isAuthenticated = useIsAuthenticated();
  const logoutMutation = useLogout();
  const { data: courses = [], isLoading } = useCourses();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Mini LMS Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.name || user?.email}!
              </span>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Courses</h2>

          {isLoading ? (
            <div className="text-gray-600">Loading courses...</div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const lessonsCount = course?.lessons?.length || 0;
                const thumbnailUrl = getFileUrl(course?.thumbnail);
                return (
                  <div key={course.id} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
                    <div className="aspect-video bg-gray-100">
                      {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                      {course.description && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{course.description}</p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500">{lessonsCount} lesson{lessonsCount !== 1 ? 's' : ''}</span>
                        <a href={`/courses/${course.id}`} className="text-indigo-600 text-sm font-medium hover:underline">View</a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
