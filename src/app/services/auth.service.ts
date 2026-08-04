import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../api/api';
import { auth, refresh } from '../api/functions';

export interface UserData {
    id?: number;
    idUser?: number;
    firstName: string;
    surName: string;
    email: string;
    cellPhone?: string;
    dni?: string;
    image?: string;
    role: string;
    token?: string;
    refreshToken?: string;

    [key: string]: any;
}

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly router = inject(Router);
    private readonly api = inject(Api);

    readonly currentUser = signal<UserData | null>(this.getUserFromStorage());

    private lastActivity = Date.now();
    private watcherIntervalId: any = null;

    registerActivity(): void {
        this.lastActivity = Date.now();
    }

    private hadRecentActivity(): boolean {
        return Date.now() - this.lastActivity < INACTIVITY_LIMIT_MS;
    }

    private getUserFromStorage(): UserData | null {
        const rawUser = localStorage.getItem('current_user');
        if (!rawUser) return null;
        try {
            return JSON.parse(rawUser);
        } catch {
            return null;
        }
    }

    saveSession(userData: UserData, token?: string): void {
        const jwtToken = token || userData.token || userData['token'];
        const refreshToken = userData.refreshToken || userData['refreshToken'];

        if (jwtToken) localStorage.setItem('auth_token', jwtToken);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);

        localStorage.setItem('current_user', JSON.stringify(userData));
        sessionStorage.setItem('loggedIn', 'true');
        this.currentUser.set(userData);
        this.registerActivity();
        this.startSessionWatcher();
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    updateCurrentUser(partialUser: Partial<UserData>): void {
        const current = this.currentUser();
        if (!current) return;

        const updatedUser = { ...current, ...partialUser };
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
        this.currentUser.set(updatedUser);
    }

    logout(reason?: string): void {
        this.stopSessionWatcher();
        localStorage.removeItem('current_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('loggedIn');
        this.currentUser.set(null);

        this.router.navigate(['/login'], {
            queryParams: reason ? { reason } : undefined
        });
    }

    login(email: string, password: string): Promise<{ ok: boolean; message: string }> {
        return this.api.invoke$Response(auth, { body: { email, password } })
            .then((raw: any) => {
                const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

                if (data.type !== 'success') {
                    return { ok: false, message: data.listMessage?.[0] ?? 'No se pudo iniciar sesión.' };
                }

                this.saveSession(data as UserData);
                return { ok: true, message: data.listMessage?.[0] ?? 'Bienvenido.' };
            })
            .catch(() => ({ ok: false, message: 'Error al conectar con el servidor.' }));
    }

    private refreshSession(): void {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.logout('session_expired');
            return;
        }

        this.api.invoke$Response(refresh, { body: { refreshToken } })
            .then((raw: any) => {
                const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

                if (data.type !== 'success') {
                    this.logout('session_expired');
                    return;
                }

                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('refresh_token', data.refreshToken);
            })
            .catch(() => {
                this.logout('session_expired');
            });
    }

    private startSessionWatcher(): void {
        this.stopSessionWatcher();

        this.watcherIntervalId = setInterval(() => {
            if (this.hadRecentActivity()) {
                this.refreshSession();
            } else {
                this.logout('inactivity');
            }
        }, CHECK_INTERVAL_MS);
    }

    private stopSessionWatcher(): void {
        if (this.watcherIntervalId) {
            clearInterval(this.watcherIntervalId);
            this.watcherIntervalId = null;
        }
    }

    resumeSessionWatcher(): void {
        if (this.currentUser() && this.getRefreshToken()) {
            this.registerActivity();
            this.startSessionWatcher();
        }
    }
}