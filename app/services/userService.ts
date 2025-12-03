import { apiClient } from './api';

// Tipos para usuário
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'nutritionist';
    crn?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    crn?: string;
}

// Serviços de usuário
export class UserService {
    // Obter perfil do usuário atual
    static async getProfile(): Promise<User> {
        return apiClient.get<User>('/users/profile');
    }

    // Atualizar perfil do usuário
    static async updateProfile(userData: UpdateUserRequest): Promise<User> {
        return apiClient.put<User>('/users/profile', userData);
    }

    // Alterar senha
    static async changePassword(data: {
        currentPassword: string;
        newPassword: string;
    }): Promise<void> {
        return apiClient.put<void>('/users/change-password', data);
    }

    // Deletar conta
    static async deleteAccount(): Promise<void> {
        return apiClient.delete<void>('/users/profile');
    }
}

export default UserService;