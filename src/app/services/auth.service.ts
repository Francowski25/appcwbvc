import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface UserData {
    id?: number;
    idUser?: number;
    firstName: string;
    surName: string;
    email: string;
    cellPhone?: string;
    image?: string;
    role: string;
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly router = inject(Router);

    readonly currentUser = signal<UserData | null>(this.getUserFromStorage());
    private getUserFromStorage(): UserData | null {
        const rawUser = localStorage.getItem('current_user');
        if (!rawUser) return null;
        try {
            return JSON.parse(rawUser);
        } catch {
            return null;
        }
    }

    saveSession(userData: UserData): void {
        localStorage.setItem('current_user', JSON.stringify(userData));
        sessionStorage.setItem('loggedIn', 'true');
        this.currentUser.set(userData);
    }

    updateCurrentUser(partialUser: Partial<UserData>): void {
        const current = this.currentUser();
        if (!current) return;

        const updatedUser = { ...current, ...partialUser };
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
        this.currentUser.set(updatedUser);
    }

    logout(): void {
        localStorage.removeItem('current_user');
        sessionStorage.removeItem('loggedIn');
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }
}