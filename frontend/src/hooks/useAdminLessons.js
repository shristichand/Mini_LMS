import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService, lessonsService } from "../services/api";
import toast from "react-hot-toast";

/**
 * Custom hook for managing admin lessons
 * @param {string|number} courseId - Course ID
 * @returns {Object} Object containing queries, mutations, and state
 */
export const useAdminLessons = (courseId) => {
  const queryClient = useQueryClient();

  // Queries
  const courseQuery = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => coursesService.getCourseById(courseId),
  });

  const lessonsQuery = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: () => lessonsService.getLessonsByCourse(courseId),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => lessonsService.createLesson(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      toast.success("Lesson created successfully");
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || "Failed to create lesson";
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ lessonId, payload }) => lessonsService.updateLesson(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      toast.success("Lesson updated successfully");
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || "Failed to update lesson";
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (lessonId) => lessonsService.deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      toast.success("Lesson deleted successfully");
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || "Failed to delete lesson";
      toast.error(errorMessage);
    },
  });

  return {
    // Data
    course: courseQuery.data,
    lessons: lessonsQuery.data || [],
    
    // Loading states
    isCourseLoading: courseQuery.isLoading,
    isLessonsLoading: lessonsQuery.isLoading,
    
    // Mutations
    createLesson: createMutation.mutate,
    updateLesson: updateMutation.mutate,
    deleteLesson: deleteMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
