import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { InternalNotificationService } from '@/models/InternalNotification';
import { authMiddleware } from '@/middlewares/auth';

/**
 * 📊 NOTIFICATION STATISTICS
 * ==========================
 * Endpoint para obter estatísticas das notificações do usuário
 */

// GET /api/notifications/stats
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const stats = await InternalNotificationService.getNotificationStats(
      authResult.user.uid
    );

    if (!stats.success) {
      return NextResponse.json({ error: stats.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      statistics: stats.data
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}