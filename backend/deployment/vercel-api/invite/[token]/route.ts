import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PatientInviteService } from '@/services/PatientInviteService';

/**
 * 🎯 ACCEPT PATIENT INVITE
 * ========================
 * Endpoint público para paciente aceitar convite
 */

const patientInviteService = new PatientInviteService();

// GET /api/invite/[token] - Visualizar convite
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const { token } = params;

    if (!token) {
      return NextResponse.json({ 
        error: 'Token do convite é obrigatório' 
      }, { status: 400 });
    }

    // Buscar convite
    const invite = await patientInviteService.getInviteByToken(token);

    // Verificar se convite ainda é válido
    if (invite.status !== 'pending') {
      let message = 'Este convite não está mais disponível';
      if (invite.status === 'accepted') {
        message = 'Este convite já foi aceito';
      } else if (invite.status === 'expired') {
        message = 'Este convite expirou';
      } else if (invite.status === 'rejected') {
        message = 'Este convite foi rejeitado';
      }
      
      return NextResponse.json({ 
        error: message,
        status: invite.status 
      }, { status: 410 });
    }

    if (new Date() > invite.expiresAt) {
      // Atualizar status para expirado
      invite.status = 'expired';
      await invite.save();
      
      return NextResponse.json({ 
        error: 'Este convite expirou',
        status: 'expired'
      }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: invite.id,
        nutritionist: {
          name: invite.nutritionistId.name,
          crn: invite.nutritionistId.crn,
          email: invite.nutritionistId.email
        },
        patientName: invite.patientName,
        patientEmail: invite.patientEmail,
        message: invite.message,
        expiresAt: invite.expiresAt,
        sentAt: invite.sentAt
      }
    });

  } catch (error) {
    console.error('Erro ao buscar convite:', error);
    return NextResponse.json({ 
      error: error.message || 'Convite não encontrado' 
    }, { status: 404 });
  }
}

// POST /api/invite/[token] - Aceitar convite
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const { token } = params;
    const body = await request.json();

    if (!token) {
      return NextResponse.json({ 
        error: 'Token do convite é obrigatório' 
      }, { status: 400 });
    }

    // Validar dados do paciente
    const { name, phone, birthDate, gender, address } = body;

    if (!name || !phone || !birthDate || !gender) {
      return NextResponse.json({ 
        error: 'Todos os campos obrigatórios devem ser preenchidos' 
      }, { status: 400 });
    }

    // Validar formato da data de nascimento
    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) {
      return NextResponse.json({ 
        error: 'Data de nascimento inválida' 
      }, { status: 400 });
    }

    // Validar idade mínima (16 anos)
    const minAge = new Date();
    minAge.setFullYear(minAge.getFullYear() - 16);
    if (birthDateObj > minAge) {
      return NextResponse.json({ 
        error: 'Paciente deve ter pelo menos 16 anos' 
      }, { status: 400 });
    }

    // Validar gênero
    if (!['M', 'F', 'male', 'female'].includes(gender)) {
      return NextResponse.json({ 
        error: 'Gênero inválido' 
      }, { status: 400 });
    }

    // Normalizar gênero
    const normalizedGender = gender === 'male' ? 'M' : gender === 'female' ? 'F' : gender;

    // Aceitar convite e criar paciente
    const patient = await patientInviteService.acceptInvite(token, {
      name: name.trim(),
      phone: phone.trim(),
      birthDate: birthDateObj,
      gender: normalizedGender,
      address: address || {}
    });

    return NextResponse.json({
      success: true,
      data: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        message: 'Convite aceito com sucesso! Bem-vindo ao sistema.'
      },
      message: 'Convite aceito com sucesso!'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// DELETE /api/invite/[token] - Rejeitar convite
export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const { token } = params;

    if (!token) {
      return NextResponse.json({ 
        error: 'Token do convite é obrigatório' 
      }, { status: 400 });
    }

    // Rejeitar convite
    await patientInviteService.rejectInvite(token);

    return NextResponse.json({
      success: true,
      message: 'Convite rejeitado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao rejeitar convite:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
}