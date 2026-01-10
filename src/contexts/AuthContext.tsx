import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAdmin: boolean;
    loading: boolean;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkRole = async (userId: string) => {
        console.log('AuthContext Debug: checkRole started for:', userId);
        try {
            const queryPromise = supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .eq('role', 'admin')
                .maybeSingle();

            // Keep a timeout so the UI doesn't hang forever if the DB is unreachable,
            // but treat timeout as a real error (instead of silently returning "not admin").
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000));

            const { data, error }: any = await Promise.race([queryPromise, timeoutPromise]).catch((e) => ({ data: null, error: e }));

            if (error) {
                console.error('AuthContext Debug: Error checking role:', error);
                return false;
            }
            console.log('AuthContext Debug: checkRole finished. Data:', data);
            return !!data;
        } catch (e) {
            console.error('AuthContext Debug: Role check exception:', e);
            return false;
        }
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            console.log('AuthContext Debug: Initializing...');
            try {
                // getSession is local/fast in normal conditions; timing it out can cause
                // false "logged out" states and route flicker (dashboard -> login -> dashboard).
                const {
                    data: { session: currentSession },
                } = await supabase.auth.getSession();

                if (!mounted) return;

                console.log('AuthContext Debug: Session checked. Found:', !!currentSession);
                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    const isUserAdmin = await checkRole(currentSession.user.id);
                    if (mounted) setIsAdmin(isUserAdmin);
                }
            } catch (err) {
                console.error('AuthContext Debug: Error during init:', err);
            } finally {
                if (mounted) {
                    console.log('AuthContext Debug: Setting loading to false');
                    setLoading(false);
                }
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!mounted) return;
            console.log('AuthContext Debug: Event:', event, 'Session:', !!currentSession);

            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (currentSession?.user) {
                const isUserAdmin = await checkRole(currentSession.user.id);
                if (mounted) {
                    setIsAdmin(isUserAdmin);
                    setLoading(false);
                }
            } else {
                if (mounted) {
                    setIsAdmin(false);
                    setLoading(false);
                }
            }
        });

        init();
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            isAdmin,
            loading,
            isAuthenticated: !!user,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
