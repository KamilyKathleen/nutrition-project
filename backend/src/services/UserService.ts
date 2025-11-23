import { UserModel } from '../models/User';
import { User, CreateUserRequest, UserRole } from '../types';
import { AppError } from '../middlewares/errorHandler';
import mongoose from 'mongoose';

export class UserService {
  async create(userData: CreateUserRequest & { password: string }): Promise<User> {
    try {
      // 🔍 Verificar se email já existe
      const existingUser = await UserModel.findOne({ 
        email: userData.email.toLowerCase() 
      });
      
      if (existingUser) {
        throw new AppError('Email já cadastrado', 400);
      }

      // 🔍 Verificar se CPF já existe
      const existingCpf = await UserModel.findOne({ 
        cpf: userData.cpf 
      });
      
      if (existingCpf) {
        throw new AppError('CPF já cadastrado', 400);
      }

      const user = new UserModel({
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: userData.password,
        cpf: userData.cpf,
        phone: userData.phone,
        crn: userData.crn, // 🏥 CRN para nutricionistas
        role: userData.role,
        isActive: true
      });

      const savedUser = await user.save();
      return savedUser.toJSON() as User;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 11000) {
        throw new AppError('Email ou CPF já cadastrado', 400);
      }
      throw new AppError('Erro ao criar usuário', 500);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const user = await UserModel.findById(id).exec();
      return user ? (user.toJSON() as User) : null;
    } catch (error) {
      throw new AppError('Erro ao buscar usuário', 500);
    }
  }

  async findByEmail(email: string): Promise<(User & { password: string }) | null> {
    try {
      const user = await UserModel.findOne({ 
        email: email.toLowerCase() 
      }).select('+password').exec();

      if (!user) return null;

      // 🔧 Não usar toJSON() aqui para preservar a senha
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        // 🔥 CPF e phone removidos - usuários Firebase não têm esses campos
        crn: user.crn, // 🏥 Incluir CRN
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        firebaseUid: user.firebaseUid, // 🔥 Firebase UID obrigatório
        emailVerified: user.emailVerified, // 🔥 Status de verificação do email
        password: user.password  // 🔐 Manter senha para comparação
      } as User & { password: string };
    } catch (error) {
      throw new AppError('Erro ao buscar usuário por email', 500);
    }
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('ID de usuário inválido', 400);
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).exec();

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      return user.toJSON() as User;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 11000) {
        throw new AppError('Email já está em uso', 400);
      }
      throw new AppError('Erro ao atualizar usuário', 500);
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('ID de usuário inválido', 400);
      }

      await UserModel.findByIdAndUpdate(id, { 
        lastLogin: new Date() 
      }).exec();
    } catch (error) {
      throw new AppError('Erro ao atualizar último login', 500);
    }
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('ID de usuário inválido', 400);
      }

      const result = await UserModel.findByIdAndUpdate(id, { 
        password: hashedPassword 
      }).exec();

      if (!result) {
        throw new AppError('Usuário não encontrado', 404);
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao atualizar senha', 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('ID de usuário inválido', 400);
      }

      const result = await UserModel.findByIdAndDelete(id).exec();
      
      if (!result) {
        throw new AppError('Usuário não encontrado', 404);
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao deletar usuário', 500);
    }
  }

  async list(page: number = 1, limit: number = 20, role?: UserRole): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const filter: any = {};
      if (role) {
        filter.role = role;
      }

      const [users, total] = await Promise.all([
        UserModel.find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .exec(),
        UserModel.countDocuments(filter).exec()
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users: users.map(user => user.toJSON() as User),
        total,
        page,
        totalPages
      };
    } catch (error) {
      throw new AppError('Erro ao listar usuários', 500);
    }
  }

  async activate(id: string): Promise<User> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<User> {
    return this.update(id, { isActive: false });
  }

  async findByFirebaseUid(firebaseUid: string): Promise<(User & { password: string }) | null> {
    try {
      const user = await UserModel.findOne({ firebaseUid }).lean();
      return user as (User & { password: string }) | null;
    } catch (error) {
      throw new AppError('Erro ao buscar usuário por Firebase UID', 500);
    }
  }

  async createFirebaseUser(userData: {
    name: string;
    email: string;
    role?: string;
    firebaseUid: string;
    emailVerified?: boolean;
  }): Promise<User> {
    try {
      // 🔥 Verificar se email já existe
      const existingUser = await UserModel.findOne({ 
        email: userData.email.toLowerCase() 
      });
      
      if (existingUser) {
        throw new AppError('Email já cadastrado', 400);
      }

      // 🔥 Criar usuário Firebase básico SEM CPF, telefone, avatar
      const user = new UserModel({
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: 'firebase_auth', // Placeholder obrigatório
        role: userData.role || UserRole.PATIENT,
        isActive: true,
        firebaseUid: userData.firebaseUid,
        emailVerified: userData.emailVerified || false
        // CPF, phone e avatar são undefined (não enviamos)
      });

      const savedUser = await user.save();
      return savedUser.toJSON() as User;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 11000) {
        throw new AppError('Email ou Firebase UID já cadastrado', 400);
      }
      throw new AppError('Erro ao criar usuário Firebase', 500);
    }
  }

  async linkFirebaseUid(userId: string, firebaseUid: string): Promise<User> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { 
          firebaseUid,
          emailVerified: true // Assume que Firebase já verificou
        },
        { new: true, runValidators: false } // Não validar CPF/phone para usuários existentes
      );

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      return user.toJSON() as User;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Firebase UID já vinculado a outra conta', 400);
      }
      throw new AppError('Erro ao vincular Firebase UID', 500);
    }
  }

  // Método para comparar senha (para compatibilidade)
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}