"use client";

import { useEffect } from 'react';
import { useUser, ALL_USERS } from '@/context/UserContext';

/**
 * Auto-sets a demo user when currentUser is null (e.g. direct navigation from home portal).
 * This makes each role page fully functional without requiring a prior login.
 */
export function useRoleGuard(defaultUsercount: string) {
    const { currentUser, setCurrentUser } = useUser();

    useEffect(() => {
        if (!currentUser) {
            const user = ALL_USERS.find(u => u.usercount === defaultUsercount);
            if (user) setCurrentUser(user);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
