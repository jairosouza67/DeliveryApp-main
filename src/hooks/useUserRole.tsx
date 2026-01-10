import { useAuth } from "@/contexts/AuthContext";

export const useUserRole = () => {
  const { isAdmin, loading: isLoading } = useAuth();
  return { isAdmin, isLoading };
};
