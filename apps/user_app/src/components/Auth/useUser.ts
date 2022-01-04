import { createContext, useState } from "react";
import AuthService, { User } from "../../lib/Services/AuthService";
import { useService } from "../../lib/Services/useService";


// TODO create abstraction on LocalStorage as Service
export function useUser(): UseUserResult {
    const userFromStorage = sessionStorage.getItem('user');
    const cachedUser = userFromStorage ? JSON.parse(userFromStorage) : null;
    const authService = useService<AuthService>(AuthService);
    const [user, setUserState] = useState<User|null>(cachedUser);

    const setUser = (user: User|null) => {
        sessionStorage.setItem('user',JSON.stringify(user ? user : ''));
        setUserState(user);
    }

    const logOut = async () => {
        await authService.logOut();
        setUser(null);
        sessionStorage.removeItem('user');
    }

    const updateUser = async () => {
        const user = await authService.currentUser();
        console.log('refresh user');
        setUser(user);
    }

    return {
        user,
        setUser,
        updateUser,
        logOut
    };
}

export interface UseUserResult {
    user: User|null;
    setUser: (user:User|null) => void;
    updateUser: () => void;
    logOut: () => void;
}

export interface UserContext {
    user: User;
    setUser: (user:User|null) => void;
    updateUser: () => void;
    logOut: () => void;
}

export const userContext = createContext<UserContext|null>(null);