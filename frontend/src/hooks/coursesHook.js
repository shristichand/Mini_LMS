import { useQuery } from "@tanstack/react-query";
import { coursesService, progressService } from "../services/api";

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: coursesService.getCourses,
    staleTime: 60 * 1000,
  });
};

export const useCourseProgress = (courseId, enabled = true) => {
  return useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: () => progressService.getCourseProgress(courseId),
    enabled: enabled && !!courseId,
    staleTime: 30 * 1000,
  });
};


