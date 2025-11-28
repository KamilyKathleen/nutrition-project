export type UserRole = 'nutritionist' | 'patient';

export interface User {
    name: string;
    role: UserRole;
}