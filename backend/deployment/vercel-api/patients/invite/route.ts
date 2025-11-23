import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PatientInviteService } from '@/services/PatientInviteService';
import { authMiddleware } from '@/middlewares/auth';

/**
 * 📧 PATIENT INVITES API
 * ======================
 * Gerenciamento de convites de pacientes
 */

const patientInviteService = new PatientInviteService();

// POST /api/patients/invite - Enviar convite
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (!authResult.success || authResult.user.role !== 'nutritionist') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { patientEmail, patientName, message } = body;

    // Validações
    if (!patientEmail || !patientName) {
      return NextResponse.json({ 
        error: 'Email e nome do paciente são obrigatórios' 
      }, { status: 400 });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(patientEmail)) {
      return NextResponse.json({ 
        error: 'Email inválido' 
      }, { status: 400 });
    }

    // Enviar convite
    const invite = await patientInviteService.invitePatient({
      nutritionistId: authResult.user.id,
      patientEmail,
      patientName,
      message
    });

    return NextResponse.json({
      success: true,
      data: invite,
      message: 'Convite enviado com sucesso!'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// GET /api/patients/invite - Listar convites
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticação
    const authResult = await authMiddleware(request);
    if (!authResult.success || authResult.user.role !== 'nutritionist') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filters = {
      status: status || undefined,
      page,
      limit
    };

    const result = await patientInviteService.getInvitesByNutritionist(
      authResult.user.id,
      filters
    );

    return NextResponse.json({
      success: true,
      data: result.invites,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Erro ao buscar convites:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
}