import { useAuth } from "@/contexts/AuthContext";

export const useAuthRole = () => {
    const { isAdmin, isAuthenticated, loading } = useAuth();
    return { isAdmin, isAuthenticated, loading };
};
