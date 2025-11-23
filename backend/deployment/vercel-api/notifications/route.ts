import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { InternalNotificationService } from '@/models/InternalNotification';
import { authMiddleware } from '@/middlewares/auth';

/**
 * 🔔 NOTIFICATIONS API
 * ====================
 * Sistema de notificações internas (substitui emails)
 */

// GET /api/notifications - Listar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticação Firebase
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const read = searchParams.get('read');
    const type = searchParams.get('type');
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '20');

    const options = {
      read: read === 'true' ? true : read === 'false' ? false : undefined,
      type: type || undefined,
      page,
      limit
    };

    const result = await InternalNotificationService.getUserNotifications(
      authResult.user.uid, // Firebase UID
      options
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Criar nova notificação (admin)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      targetUserId,
      type,
      title,
      message,
      data,
      actionRequired,
      actionUrl,
      actionLabel,
      priority,
      expiresAt
    } = body;

    // Validações básicas
    if (!targetUserId || !type || !title || !message) {
      return NextResponse.json({
        error: 'Campos obrigatórios: targetUserId, type, title, message'
      }, { status: 400 });
    }

    const result = await InternalNotificationService.create({
      userId: targetUserId,
      type,
      title,
      message,
      data,
      actionRequired,
      actionUrl,
      actionLabel,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: authResult.user.uid
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.notification,
      message: 'Notificação criada com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}