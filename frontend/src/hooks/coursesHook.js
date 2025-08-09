import { useQuery } from "@tanstack/react-query";
import { coursesService } from "../services/api";

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: coursesService.getCourses,
    staleTime: 60 * 1000,
  });
};


