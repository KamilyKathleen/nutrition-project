import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { InternalNotificationService } from '@/models/InternalNotification';
import { authMiddleware } from '@/middlewares/auth';

/**
 * 🔔 NOTIFICATION ACTIONS API
 * ===========================
 */

// PATCH /api/notifications/[id] - Marcar como lida
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { action } = body; // 'read' ou 'unread'

    if (action === 'read') {
      const result = await InternalNotificationService.markAsRead(
        id,
        authResult.user.uid
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: result.notification,
        message: 'Notificação marcada como lida'
      });
    }

    return NextResponse.json({
      error: 'Ação inválida. Use: read'
    }, { status: 400 });

  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Deletar notificação
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { id } = params;

    const result = await InternalNotificationService.delete(
      id,
      authResult.user.uid
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notificação removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}