import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { InternalNotificationService } from '@/models/InternalNotification';
import { authMiddleware } from '@/middlewares/auth';

/**
 * 🔔 MARK ALL NOTIFICATIONS AS READ
 * =================================
 */

// POST /api/notifications/mark-all-read
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const result = await InternalNotificationService.markAllAsRead(
      authResult.user.uid
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} notificações marcadas como lidas`
    });

  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}