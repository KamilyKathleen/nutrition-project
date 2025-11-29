'use client';

import { useState, useEffect } from "react";
import { Mail, Clock, X, Check, AlertCircle } from "lucide-react";
import { inviteService, PendingInvite } from "../../services/inviteService";

interface PendingInvitesProps {
  onInviteAccepted?: () => void;
}

export default function PendingInvites({ onInviteAccepted }: PendingInvitesProps) {
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 📋 Carregar convites pendentes
  useEffect(() => {
    loadPendingInvites();
  }, []);

  const loadPendingInvites = async () => {
    try {
      setLoading(true);
      setError(null);
      const pendingInvites = await inviteService.getPendingInvites();
      setInvites(pendingInvites);
    } catch (err: any) {
      console.error('Erro ao carregar convites:', err);
      setError('Erro ao carregar convites pendentes');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Aceitar convite
  const handleAcceptInvite = async (inviteId: string) => {
    try {
      setProcessingInvite(inviteId);
      await inviteService.acceptInvite(inviteId);
      
      // Remover convite da lista
      setInvites(prev => prev.filter(invite => invite.id !== inviteId));
      
      // Notificar o componente pai que um convite foi aceito
      if (onInviteAccepted) {
        onInviteAccepted();
      }

      // Mostrar mensagem de sucesso
      alert('Convite aceito com sucesso! Agora você está vinculado ao nutricionista.');
    } catch (err: any) {
      console.error('Erro ao aceitar convite:', err);
      alert('Erro ao aceitar convite. Tente novamente.');
    } finally {
      setProcessingInvite(null);
    }
  };

  // ❌ Recusar convite (por enquanto só remove da lista)
  const handleRejectInvite = async (inviteId: string) => {
    const confirmReject = confirm('Tem certeza que deseja recusar este convite?');
    if (!confirmReject) return;

    try {
      setProcessingInvite(inviteId);
      // Por enquanto apenas remove da lista (implementar reject no backend depois)
      setInvites(prev => prev.filter(invite => invite.id !== inviteId));
      alert('Convite recusado');
    } catch (err: any) {
      console.error('Erro ao recusar convite:', err);
      alert('Erro ao recusar convite. Tente novamente.');
    } finally {
      setProcessingInvite(null);
    }
  };

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Mail className="text-blue-600 mr-2 animate-pulse" size={20} />
          <span className="text-blue-800">Carregando convites...</span>
        </div>
      </div>
    );
  }

  // ❌ Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="text-red-600 mr-2" size={20} />
          <span className="text-red-800">{error}</span>
          <button 
            onClick={loadPendingInvites}
            className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // 📭 No invites state
  if (invites.length === 0) {
    return null; // Não mostrar nada se não há convites
  }

  // 📬 Convites pendentes
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <Mail className="text-blue-600 mr-2" size={20} />
        <h3 className="text-lg font-semibold text-blue-800">
          {invites.length === 1 ? 'Convite Pendente' : `${invites.length} Convites Pendentes`}
        </h3>
      </div>
      
      <div className="space-y-3">
        {invites.map((invite) => (
          <div key={invite.id} className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="font-medium text-gray-800">
                    {invite.nutritionist?.name || 'Nutricionista'}
                  </h4>
                  {invite.nutritionist?.email && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({invite.nutritionist.email})
                    </span>
                  )}
                </div>
                
                {invite.message && (
                  <p className="text-gray-600 text-sm mb-2 bg-gray-50 p-2 rounded">
                    "{invite.message}"
                  </p>
                )}
                
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  <span>Enviado em: {new Date(invite.sentAt).toLocaleDateString('pt-BR')}</span>
                  <span className="ml-3">
                    Expira em: {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button 
                  onClick={() => handleAcceptInvite(invite.id)}
                  disabled={processingInvite === invite.id}
                  className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={14} className="mr-1" />
                  {processingInvite === invite.id ? 'Aceitando...' : 'Aceitar'}
                </button>
                
                <button 
                  onClick={() => handleRejectInvite(invite.id)}
                  disabled={processingInvite === invite.id}
                  className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={14} className="mr-1" />
                  Recusar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}