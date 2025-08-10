import { useQuery } from "@tanstack/react-query";
import { coursesService, progressService } from "../services/api";

/**
 * Hook to fetch all courses
 * @returns {Object} Query object with courses data and loading state
 */
export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: coursesService.getCourses,
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch course progress for a specific course
 * @param {string|number} courseId - Course ID
 * @param {boolean} enabled - Whether the query should run
 * @returns {Object} Query object with progress data and loading state
 */
export const useCourseProgress = (courseId, enabled = true) => {
  return useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: () => progressService.getCourseProgress(courseId),
    enabled: enabled && !!courseId,
    staleTime: 30 * 1000, // 30 seconds
  });
};


