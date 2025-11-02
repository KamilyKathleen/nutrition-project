import { UserModel } from '@/models/User';
import { User, CreateUserRequest, UserRole } from '@/types';
import { AppError } from '@/middlewares/errorHandler';
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
        cpf: user.cpf,
        phone: user.phone,
        crn: user.crn, // 🏥 Incluir CRN
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
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
}