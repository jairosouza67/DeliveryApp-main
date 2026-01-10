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
            if (mounted) setLoading(true);
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

            // Avoid intermediate renders where loading=false but user/isAdmin haven't updated yet.
            setLoading(true);

            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            try {
                if (currentSession?.user) {
                    const isUserAdmin = await checkRole(currentSession.user.id);
                    if (mounted) setIsAdmin(isUserAdmin);
                } else {
                    if (mounted) setIsAdmin(false);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        });

        init();
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        setLoading(true);
        try {
            // Prefer local sign-out to avoid failures when offline/slow network.
            // Admin guards rely on local session state, so this prevents "logout doesn't work".
            await supabase.auth.signOut({ scope: 'local' });
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            // Ensure UI updates immediately even if the auth event is delayed.
            setSession(null);
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
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
