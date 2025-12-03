import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { ApiResponse, PaginatedResponse, AuthenticatedRequest, UserRole } from '../types';
import { config } from '../config/environment';

export class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * 📋 LISTAR USUÁRIOS
   * Função: Buscar todos os usuários com paginação e filtros
   * Por que: Permite visualizar todos os usuários do sistema
   */
  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Extrair parâmetros de query (página, limite, filtro por role)
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Math.min(
      Number.parseInt(req.query.limit as string) || config.DEFAULT_PAGE_SIZE,
      config.MAX_PAGE_SIZE
    );
    const role = req.query.role as UserRole | undefined;

    // Chamar o serviço para buscar os dados
    const result = await this.userService.list(page, limit, role);

    // Montar resposta paginada
    const response: PaginatedResponse<any> = {
      success: true,
      message: 'Usuários listados com sucesso',
      data: result.users,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1
      }
    };

    res.json(response);
  });

  /**
   * 🔍 BUSCAR USUÁRIO POR ID
   * Função: Encontrar um usuário específico
   * Por que: Visualizar detalhes de um usuário
   */
  findById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validar se ID foi fornecido
    if (!id) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    // Buscar usuário
    const user = await this.userService.findById(id);
    
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Usuário encontrado',
      data: user
    };

    res.json(response);
  });

  /**
   * ✏️ ATUALIZAR USUÁRIO
   * Função: Modificar dados de um usuário
   * Por que: Permitir edição de perfil
   */
  update = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body as Partial<{ name: string; email: string; avatar: string }>;
    const currentUser = req.user!;

    // Validar se ID foi fornecido
    if (!id) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    // Verificar permissões: usuário só pode editar próprio perfil, exceto admins
    if (currentUser.userId !== id && currentUser.role !== UserRole.ADMIN) {
      throw new AppError('Sem permissão para editar este usuário', 403);
    }

    // Validar dados de entrada
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new AppError('Dados para atualização são obrigatórios', 400);
    }

    // Atualizar usuário
    const updatedUser = await this.userService.update(id, updateData);

    const response: ApiResponse = {
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: updatedUser
    };

    res.json(response);
  });

  /**
   * 🗑️ DELETAR USUÁRIO
   * Função: Remover usuário do sistema
   * Por que: Limpeza de dados, usuários inativos
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validar se ID foi fornecido
    if (!id) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    // Verificar se usuário existe
    const user = await this.userService.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Deletar usuário (soft delete - apenas desativa)
    await this.userService.deactivate(id);

    const response: ApiResponse = {
      success: true,
      message: 'Usuário removido com sucesso'
    };

    res.json(response);
  });

  /**
   * ✅ ATIVAR USUÁRIO
   * Função: Reativar usuário desativado
   * Por que: Restaurar acesso de usuários
   */
  activate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validar se ID foi fornecido
    if (!id) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    const user = await this.userService.activate(id);

    const response: ApiResponse = {
      success: true,
      message: 'Usuário ativado com sucesso',
      data: user
    };

    res.json(response);
  });

  /**
   * ❌ DESATIVAR USUÁRIO
   * Função: Desativar usuário sem deletar
   * Por que: Suspender acesso temporariamente
   */
  deactivate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validar se ID foi fornecido
    if (!id) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    const user = await this.userService.deactivate(id);

    const response: ApiResponse = {
      success: true,
      message: 'Usuário desativado com sucesso',
      data: user
    };

    res.json(response);
  });

  /**
   * � BUSCAR USUÁRIO POR E-MAIL
   * Função: Buscar usuários pelo e-mail (para vincular paciente)
   * Por que: Permite nutricionistas encontrarem usuários existentes
   */
  searchByEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.query;

    // Validar se e-mail foi fornecido
    if (!email || typeof email !== 'string') {
      throw new AppError('E-mail é obrigatório', 400);
    }

    // Buscar usuários que correspondem ao e-mail
    const users = await this.userService.searchByEmail(email);

    const response: ApiResponse = {
      success: true,
      message: users.length > 0 ? 'Usuários encontrados' : 'Nenhum usuário encontrado',
      data: users
    };

    res.json(response);
  });

  /**
   * �🔄 ALTERAR ROLE (apenas admin)
   * Função: Mudar papel do usuário
   * Por que: Promover/rebaixar usuários
   */
  changeRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { role } = req.body;

    // Validar se ID foi fornecido
    if (!id) {
      throw new AppError('ID do usuário é obrigatório', 400);
    }

    // Validar role
    if (!Object.values(UserRole).includes(role)) {
      throw new AppError('Role inválido', 400);
    }

    const user = await this.userService.update(id, { role });

    const response: ApiResponse = {
      success: true,
      message: 'Role atualizado com sucesso',
      data: user
    };

    res.json(response);
  });
}