import { UserModel } from '../models/User';
import { User, CreateUserRequest, UserRole } from '../types';
import { AppError } from '../middlewares/errorHandler';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export class UserService {
  async create(userData: CreateUserRequest & { password: string }): Promise<User> {
    try {
      // 🔍 Verificar se email já existe
      const emailToCheck = userData.email.toLowerCase();
      console.log('Verificando email:', emailToCheck);
      
      const existingUser = await UserModel.findOne({ 
        email: emailToCheck 
      });
      console.log('Usuário encontrado:', existingUser ? 'SIM' : 'NÃO');
      
      if (existingUser) {
        throw new AppError('Email já cadastrado', 400);
      }

      // Hash da senha antes de salvar
      const saltRounds = 12;
      console.log(`🔍 Criação: Senha original: ${userData.password}`);
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      console.log(`🔍 Criação: Senha hashada: ${hashedPassword.substring(0, 15)}...`);

      const userDoc: any = {
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        crn: userData.crn, // 🏥 CRN para nutricionistas
        role: userData.role,
        isActive: true,
        emailVerified: false
      };

      // firebaseUid será undefined por padrão (não incluído em userData)

      const user = new UserModel(userDoc);

      const savedUser = await user.save();
      return savedUser.toJSON() as User;
    } catch (error: any) {
      console.error('Erro detalhado na criação do usuário:', error);
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 11000) {
        throw new AppError('Email já cadastrado', 400);
      }
      // Lançar erro mais específico
      throw new AppError(error.message || 'Erro ao criar usuário', 500);
    }
  }

  /**
   * 🔥 CRIAR USUÁRIO FIREBASE
   * ========================
   * Cria usuário no MongoDB para integração com Firebase Auth
   */
  async createFirebaseUser(userData: {
    name: string;
    email: string;
    password?: string;
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

      // 🔥 Preparar senha (hash se fornecida, placeholder se não)
      let hashedPassword = 'firebase_auth'; // Placeholder para Firebase-only users
      if (userData.password) {
        const saltRounds = 12;
        hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        console.log(`🔍 Firebase User: Senha hashada para login local`);
      }

      // 🔥 Criar usuário Firebase básico SEM CPF, telefone, avatar
      const user = new UserModel({
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
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

  // Método para deletar usuário (MongoDB + Firebase)
  async delete(id: string): Promise<void> {
    try {
      // Buscar usuário para pegar Firebase UID
      const user = await UserModel.findById(id);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Se tem Firebase UID, deletar do Firebase também
      if (user.firebaseUid) {
        try {
          const { adminAuth } = await import('../lib/firebase-admin');
          if (adminAuth) {
            await adminAuth.deleteUser(user.firebaseUid);
            console.log(`🗑️ Usuário deletado do Firebase: ${user.email}`);
          }
        } catch (firebaseError: any) {
          console.error(`❌ Erro ao deletar do Firebase: ${firebaseError.message}`);
          // Continuar mesmo se falhar no Firebase
        }
      }

      // Deletar do MongoDB
      await UserModel.findByIdAndDelete(id);
      console.log(`🗑️ Usuário deletado do MongoDB: ${user.email}`);
      
    } catch (error: any) {
      throw new AppError('Erro ao deletar usuário', 500);
    }
  }

  // Método para limpar TODOS os usuários (MongoDB + Firebase)
  async deleteAll(): Promise<void> {
    try {
      // Buscar todos os usuários
      const users = await UserModel.find({});
      
      // Deletar do Firebase primeiro
      try {
        const { adminAuth } = await import('../lib/firebase-admin');
        if (adminAuth) {
          const firebaseUsers = await adminAuth.listUsers();
          for (const fbUser of firebaseUsers.users) {
            try {
              await adminAuth.deleteUser(fbUser.uid);
              console.log(`🗑️ Firebase: ${fbUser.email || fbUser.uid} deletado`);
            } catch (error: any) {
              console.error(`❌ Erro ao deletar Firebase user ${fbUser.uid}:`, error.message);
            }
          }
        } else {
          console.log('⚠️ Firebase Admin não configurado - pulando limpeza Firebase');
        }
      } catch (firebaseError: any) {
        console.error('❌ Erro na limpeza do Firebase:', firebaseError.message);
      }

      // Deletar todos do MongoDB
      const result = await UserModel.deleteMany({});
      console.log(`🗑️ MongoDB: ${result.deletedCount} usuários deletados`);
      
    } catch (error: any) {
      throw new AppError('Erro ao limpar usuários', 500);
    }
  }

  // Método para comparar senha (para compatibilidade)
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}