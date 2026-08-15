import React, { useState } from 'react';
import { WeeklyReport, UserRole, ReportingStatus } from '@shared/types';
import { 
  X, Calendar, MapPin, User, Mail, Phone, AlertCircle, 
  CheckCircle2, Clock, MessageSquare, Send, ShieldAlert,
  HelpCircle, ArrowRight, Activity, Users, AlertTriangle, Sparkles, Check,
  RefreshCw, Paperclip, Zap, FileText
} from 'lucide-react';
import { ReportingWorkflowStepper } from './ReportingWorkflowStepper';
import { PriorityBadge, ReportTypeBadge } from './PriorityBadge';

interface ReportDetailModalProps {
  report: WeeklyReport | null;
  isOpen: boolean;
  userRole: UserRole;
  currentUserName?: string;
  onClose: () => void;
  onUpdateStatus: (reportId: string, status: ReportingStatus, bureauNotes?: string) => void;
  onDelete?: (reportId: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  userRole,
  currentUserName,
  onClose,
  onUpdateStatus,
  onDelete
}) => {
  if (!isOpen || !report) return null;

  const [bureauNotes, setBureauNotes] = useState(report.bureauNotes || '');
  const [selectedStatus, setSelectedStatus] = useState<ReportingStatus>(report.status || 'NOUVEAU');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const lastActivity = report.lastActivityAt || report.updatedAt || report.createdAt;

  const handleSaveBureauNotes = (newStatus?: ReportingStatus) => {
    setIsSaving(true);
    const targetStatus = newStatus || selectedStatus;
    setSelectedStatus(targetStatus);
    onUpdateStatus(report.id, targetStatus, bureauNotes);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    }, 300);
  };

  const handleQuickStatusChange = (status: ReportingStatus) => {
    setSelectedStatus(status);
    handleSaveBureauNotes(status);
  };

  // Quick preset notes for the admin
  const quickNotesPresets = [
    "Dossier pris en charge par le Bureau. Nous contactons les partenaires locaux.",
    "Problème réglé et solution validée avec succès. Merci pour ta vigilance sur le terrain !",
    "Demande d'appui transmise au pôle Solidarité & Logement MDF pour accompagnement direct.",
    "Budget / supports de communication validés par la Trésorerie MDF."
  ];

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatFullDateTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-emerald-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 relative flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <ReportTypeBadge type={report.type} size="md" />
                <PriorityBadge priority={report.priority} urgenceLevel={report.urgenceLevel} size="md" />
                <span className="bg-white/10 text-slate-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/10">
                  Zone : {report.zone}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                {report.sujet || (report.type === 'PONCTUEL' ? 'Remontée ponctuelle urgente' : `Reporting d'activité — ${report.zone}`)}
              </h3>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Semaine du {formatDate(report.semaineLundi)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Créée le {formatFullDateTime(report.createdAt)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dernière activité : {formatFullDateTime(lastActivity)}</span>
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          
          {/* Visual Workflow Cycle Stepper */}
          <ReportingWorkflowStepper
            report={{
              ...report,
              status: selectedStatus,
              bureauNotes: bureauNotes,
              lastActivityAt: lastActivity
            }}
            variant="full"
            userRole={userRole}
            onSelectStatus={userRole === 'admin' ? handleQuickStatusChange : undefined}
            isSaving={isSaving}
          />

          {/* Referent Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm border border-emerald-300">
                {report.referentName ? report.referentName.slice(0, 2).toUpperCase() : 'RF'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Référent de Zone</p>
                <p className="text-base font-bold text-slate-900">{report.referentName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-slate-600 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>{report.email}</span>
              </div>
              {report.telephone && (
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{report.telephone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Alert if Bureau feedback requested */}
          {report.besoinRetourBureau && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4.5 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Intervention sollicitée auprès du Bureau :</span>
              </div>
              <p className="text-xs text-amber-900 font-semibold bg-white/80 p-3 rounded-xl border border-amber-200">
                {report.detailsDemandeRetour || 'Le référent a indiqué avoir besoin d\'un appui ou d\'un retour du Bureau pour ce dossier.'}
              </p>
            </div>
          )}

          {/* Section: Priority situations / Description of issue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>
                {report.type === 'PONCTUEL' ? 'Description détaillée du problème / Situation' : 'Situations prioritaires & Cas particuliers signalés'}
              </span>
            </div>
            <div className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 whitespace-pre-wrap leading-relaxed font-medium">
              {report.situationsPrioritaires || 'Aucune situation particulière détaillée.'}
            </div>
          </div>

          {/* Section: Local activities (for periodic reports) */}
          {report.activitesLocales && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Activités locales & Dynamique menée sur la zone</span>
              </div>
              <div className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 whitespace-pre-wrap leading-relaxed">
                {report.activitesLocales}
              </div>
            </div>
          )}

          {/* Section: New members contacted */}
          {report.nouveauxContactes && (
            <div className="bg-white border border-emerald-100 rounded-2xl p-4 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wide">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Nouveaux membres / contacts recensés</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 pl-6">
                {report.nouveauxContactes}
              </p>
            </div>
          )}

          {/* Attachments Section if present */}
          {report.piecesJointes && report.piecesJointes.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                <Paperclip className="w-4 h-4 text-purple-600" />
                <span>Pièces jointes & Documents ({report.piecesJointes.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {report.piecesJointes.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold truncate">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bureau Processing & Feedback Section */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Traitement & Message en direct au Référent</span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Statut :</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedStatus === 'TRAITE' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : selectedStatus === 'EN_COURS'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {selectedStatus === 'TRAITE' ? 'Traité & Réglé' : selectedStatus === 'EN_COURS' ? 'En cours de traitement' : 'Nouveau'}
                </span>
              </div>
            </div>

            {userRole === 'admin' ? (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Message / Solution apportée (visible immédiatement par le référent) :
                    </label>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-md">
                      Le référent verra ce message en temps réel
                    </span>
                  </div>
                  
                  <textarea
                    rows={3}
                    value={bureauNotes}
                    onChange={(e) => setBureauNotes(e.target.value)}
                    placeholder="Ex: Contact pris avec le référent par téléphone. Deux solutions de logement proposées et validées..."
                    className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 outline-none resize-none font-medium shadow-2xs"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="pt-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Suggestions de réponses rapides :
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickNotesPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setBureauNotes(preset)}
                          className="text-[10px] font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-lg transition-all text-left cursor-pointer"
                        >
                          {preset.slice(0, 45)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {saveSuccessMsg && (
                  <div className="bg-emerald-100 text-emerald-900 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Mise à jour enregistrée ! Le statut et le message sont maintenant visibles par le référent.</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange('EN_COURS')}
                      disabled={isSaving}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Passer à "En cours"</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange('TRAITE')}
                      disabled={isSaving}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Problème réglé & Traité</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveBureauNotes()}
                    disabled={isSaving}
                    className="px-5 py-2 bg-slate-900 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Transmission...' : 'Enregistrer & Transmettre au Référent'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {report.bureauNotes ? (
                  <div className="bg-white rounded-2xl p-4 border-2 border-emerald-300 text-xs text-slate-800 leading-relaxed font-medium shadow-2xs space-y-2">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                      <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-emerald-700" />
                        <span>Réponse officielle du Bureau :</span>
                      </p>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {report.status === 'TRAITE' ? '✅ Problème résolu' : '⏳ En cours de prise en charge'}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-emerald-950 whitespace-pre-wrap pl-2 pt-1">
                      {report.bureauNotes}
                    </p>

                    {report.reviewedBy && (
                      <p className="text-[11px] text-slate-400 pt-1 italic text-right">
                        Par {report.reviewedBy} {report.reviewedAt ? `le ${formatDate(report.reviewedAt)}` : ''}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/80 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-500 italic flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>En attente de revue par le Bureau administratif. Tout retour de l'équipe sera notifié ici.</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between flex-shrink-0">
          {userRole === 'admin' && onDelete ? (
            <button
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment supprimer ce rapport ?')) {
                  onDelete(report.id);
                  onClose();
                }
              }}
              className="text-red-600 hover:text-red-800 text-xs font-bold hover:underline cursor-pointer"
            >
              Supprimer cette remontée
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-all"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};


