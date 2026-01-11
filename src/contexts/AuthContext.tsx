import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
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

const ROLE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 min
const ROLE_TIMEOUT_MS = 2500;

type RoleCacheEntry = {
    isAdmin: boolean;
    t: number;
};

const roleCacheKey = (userId: string) => `auth:role:${userId}`;

const readRoleCache = (userId: string): RoleCacheEntry | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(roleCacheKey(userId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as RoleCacheEntry;
        if (!parsed || typeof parsed !== 'object') return null;
        if (typeof parsed.isAdmin !== 'boolean') return null;
        if (typeof parsed.t !== 'number') return null;
        return parsed;
    } catch {
        return null;
    }
};

const writeRoleCache = (userId: string, isAdmin: boolean) => {
    if (typeof window === 'undefined') return;
    try {
        const entry: RoleCacheEntry = { isAdmin, t: Date.now() };
        window.localStorage.setItem(roleCacheKey(userId), JSON.stringify(entry));
    } catch {
        // ignore
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const roleChecksInFlight = useRef<Map<string, Promise<boolean>>>(new Map());

    const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

    const shouldCheckRoleForEvent = (event: string) => {
        // Evita revalidar role em eventos frequentes como TOKEN_REFRESHED.
        return event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED';
    };

    const checkRole = async (userId: string) => {
        console.log('AuthContext Debug: checkRole started for:', userId);

        const cached = readRoleCache(userId);
        const cachedFresh = cached ? (Date.now() - cached.t) <= ROLE_CACHE_TTL_MS : false;

        // Offline: não tente bater na API (vai dar timeout). Usa cache se houver.
        if (isOffline()) {
            if (cached) return cached.isAdmin;
            return false;
        }

        // Cache recente: evita refetch em cada "volta pra aba".
        if (cachedFresh) {
            return cached!.isAdmin;
        }

        const existing = roleChecksInFlight.current.get(userId);
        if (existing) return existing;

        try {
            const queryPromise = supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .eq('role', 'admin')
                .maybeSingle();

            const timeoutSentinel = Symbol('timeout');
            const timeoutPromise = new Promise<typeof timeoutSentinel>((resolve) =>
                setTimeout(() => resolve(timeoutSentinel), ROLE_TIMEOUT_MS),
            );

            const inFlight = (async () => {
                const raced = await Promise.race([queryPromise, timeoutPromise]);
                if (raced === timeoutSentinel) {
                    console.warn('AuthContext Debug: Role check timeout (usando cache/false)');
                    return cached?.isAdmin ?? false;
                }

                const { data, error } = raced as any;
                if (error) {
                    // Quando o usuário está sem internet, isso costuma virar ERR_INTERNET_DISCONNECTED.
                    console.warn('AuthContext Debug: Error checking role:', error);
                    return cached?.isAdmin ?? false;
                }

                const isUserAdmin = !!data;
                writeRoleCache(userId, isUserAdmin);
                console.log('AuthContext Debug: checkRole finished. Data:', data);
                return isUserAdmin;
            })().finally(() => {
                roleChecksInFlight.current.delete(userId);
            });

            roleChecksInFlight.current.set(userId, inFlight);
            return await inFlight;
        } catch (e) {
            console.warn('AuthContext Debug: Role check exception:', e);
            return cached?.isAdmin ?? false;
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
                    const cached = readRoleCache(currentSession.user.id);
                    if (cached && mounted) setIsAdmin(cached.isAdmin);
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

            // Não trave o app inteiro em eventos frequentes (ex.: TOKEN_REFRESHED)
            const willCheckRole = !!currentSession?.user && shouldCheckRoleForEvent(event);
            if (willCheckRole) setLoading(true);

            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            try {
                if (currentSession?.user) {
                    const cached = readRoleCache(currentSession.user.id);
                    if (cached && mounted) setIsAdmin(cached.isAdmin);

                    if (willCheckRole) {
                        const isUserAdmin = await checkRole(currentSession.user.id);
                        if (mounted) setIsAdmin(isUserAdmin);
                    }
                } else {
                    if (mounted) setIsAdmin(false);
                }
            } finally {
                if (mounted && willCheckRole) setLoading(false);
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
