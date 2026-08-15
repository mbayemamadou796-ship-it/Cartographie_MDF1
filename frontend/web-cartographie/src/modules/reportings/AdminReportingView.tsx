import React, { useState, useMemo } from 'react';
import { WeeklyReport, CustomZone, ReportingStatus, UserRole, ReportingType, ReportingPriority, Member } from '@shared/types';
import { 
  Search, Filter, Calendar, MapPin, AlertTriangle, CheckCircle2, 
  Clock, MessageSquare, Download, HelpCircle, Eye, Trash2, 
  Users, Activity, ChevronRight, ChevronDown, ShieldAlert, Sparkles, PlusCircle,
  LayoutGrid, ListFilter, Layers, Check, ExternalLink, Archive, History, FolderKanban,
  ArrowRight, ShieldCheck, Send, Zap, FileText, Paperclip, RefreshCw, BarChart3
} from 'lucide-react';
import { ReportingWorkflowStepper } from './ReportingWorkflowStepper';
import { PriorityBadge, ReportTypeBadge } from './PriorityBadge';
import { PilotageDashboardView } from './PilotageDashboardView';

interface AdminReportingViewProps {
  reports: WeeklyReport[];
  customZones: CustomZone[];
  members?: Member[];
  userRole: UserRole;
  onOpenReportDetail: (report: WeeklyReport) => void;
  onUpdateStatus: (reportId: string, status: ReportingStatus, bureauNotes?: string) => void;
  onDeleteReport: (reportId: string) => void;
  onOpenNewReportForm?: () => void;
}

export const AdminReportingView: React.FC<AdminReportingViewProps> = ({
  reports,
  customZones,
  members = [],
  userRole,
  onOpenReportDetail,
  onUpdateStatus,
  onDeleteReport,
  onOpenNewReportForm
}) => {
  const [mainTab, setMainTab] = useState<'PILOTAGE' | 'CAS_MANAGEMENT'>('PILOTAGE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ReportingType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReportingStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ReportingPriority>('ALL');
  const [besoinRetourFilter, setBesoinRetourFilter] = useState<'ALL' | 'OUI' | 'NON'>('ALL');
  const [viewMode, setViewMode] = useState<'BY_ZONE' | 'FLAT_LIST'>('BY_ZONE');
  const [collapsedZones, setCollapsedZones] = useState<Record<string, boolean>>({});

  // Extract all unique months from reports for the month filter dropdown
  const availableMonths = useMemo(() => {
    const monthsMap = new Map<string, string>(); // '2026-08' -> 'Août 2026'
    reports.forEach((r) => {
      const dStr = r.semaineLundi || r.createdAt;
      if (dStr) {
        try {
          const d = new Date(dStr);
          if (!isNaN(d.getTime())) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
            monthsMap.set(key, capitalized);
          }
        } catch {}
      }
    });

    // Sort descending by date key
    return Array.from(monthsMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, label]) => ({ key, label }));
  }, [reports]);

  // KPI Calculations
  const totalCount = reports.length;
  const needBureauCount = reports.filter((r) => r.besoinRetourBureau && r.status !== 'TRAITE').length;
  const urgentCount = reports.filter((r) => (r.priority === 'URGENT' || r.urgenceLevel >= 4) && r.status !== 'TRAITE').length;
  const newCount = reports.filter((r) => r.status === 'NOUVEAU').length;
  const enCoursCount = reports.filter((r) => r.status === 'EN_COURS').length;
  const traiteCount = reports.filter((r) => r.status === 'TRAITE').length;
  const ponctuelCount = reports.filter((r) => r.type === 'PONCTUEL' && r.status !== 'TRAITE').length;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const fullText = [
          r.referentName,
          r.zone,
          r.email,
          r.sujet,
          r.nouveauxContactes,
          r.situationsPrioritaires,
          r.activitesLocales,
          r.detailsDemandeRetour,
          r.bureauNotes
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!fullText.includes(q)) return false;
      }

      // Zone
      if (selectedZone !== 'ALL' && r.zone.toLowerCase() !== selectedZone.toLowerCase()) {
        return false;
      }

      // Month filter
      if (selectedMonth !== 'ALL') {
        const dStr = r.semaineLundi || r.createdAt;
        if (dStr) {
          const d = new Date(dStr);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (key !== selectedMonth) return false;
        }
      }

      // Type filter
      if (typeFilter !== 'ALL' && (r.type || 'PERIODIQUE') !== typeFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }

      // Priority Filter
      if (priorityFilter !== 'ALL') {
        const currentPriority = r.priority || (r.urgenceLevel >= 4 ? 'URGENT' : r.urgenceLevel === 3 ? 'IMPORTANT' : 'NORMAL');
        if (currentPriority !== priorityFilter) return false;
      }

      // Besoin retour Bureau
      if (besoinRetourFilter === 'OUI' && !r.besoinRetourBureau) return false;
      if (besoinRetourFilter === 'NON' && r.besoinRetourBureau) return false;

      return true;
    });
  }, [reports, searchQuery, selectedZone, selectedMonth, typeFilter, statusFilter, priorityFilter, besoinRetourFilter]);

  // Grouped by Zone
  const groupedByZone = useMemo(() => {
    const groups: Record<string, WeeklyReport[]> = {};

    // Initialize with all unique zones from reports
    filteredReports.forEach((r) => {
      const zName = r.zone || 'Zone non définie';
      if (!groups[zName]) {
        groups[zName] = [];
      }
      groups[zName].push(r);
    });

    // Sort reports within each zone chronologically (newest first)
    Object.keys(groups).forEach((zKey) => {
      groups[zKey].sort((a, b) => {
        return (b.semaineLundi || '').localeCompare(a.semaineLundi || '') ||
               (b.createdAt || '').localeCompare(a.createdAt || '');
      });
    });

    // Return as array sorted alphabetically by zone name
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredReports]);

  // Count reports per zone for quick filter pill badges
  const reportsCountPerZone = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.zone] = (counts[r.zone] || 0) + 1;
    });
    return counts;
  }, [reports]);

  const toggleZoneCollapse = (zoneName: string) => {
    setCollapsedZones((prev) => ({
      ...prev,
      [zoneName]: !prev[zoneName]
    }));
  };

  const handleExportCsv = () => {
    if (filteredReports.length === 0) {
      alert('Aucune donnée à exporter.');
      return;
    }

    const headers = [
      'ID',
      'Type',
      'Priorité',
      'Sujet',
      'Date Semaine (Lundi)',
      'Zone',
      'Nom Référent',
      'Email',
      'Nouveaux Contactés',
      'Situations Prioritaires',
      'Activités Locales',
      'Besoin Retour Bureau',
      'Détails Demande Retour',
      'Niveau Urgence (1-5)',
      'Statut',
      'Notes Bureau',
      'Date Création',
      'Dernière Activité'
    ];

    const rows = filteredReports.map((r) => [
      `"${r.id}"`,
      `"${r.type || 'PERIODIQUE'}"`,
      `"${r.priority || (r.urgenceLevel >= 4 ? 'URGENT' : r.urgenceLevel === 3 ? 'IMPORTANT' : 'NORMAL')}"`,
      `"${(r.sujet || '').replace(/"/g, '""')}"`,
      `"${r.semaineLundi}"`,
      `"${r.zone}"`,
      `"${r.referentName}"`,
      `"${r.email}"`,
      `"${(r.nouveauxContactes || '').replace(/"/g, '""')}"`,
      `"${(r.situationsPrioritaires || '').replace(/"/g, '""')}"`,
      `"${(r.activitesLocales || '').replace(/"/g, '""')}"`,
      r.besoinRetourBureau ? 'OUI' : 'NON',
      `"${(r.detailsDemandeRetour || '').replace(/"/g, '""')}"`,
      r.urgenceLevel,
      r.status,
      `"${(r.bureauNotes || '').replace(/"/g, '""')}"`,
      `"${r.createdAt}"`,
      `"${r.lastActivityAt || r.updatedAt || r.createdAt}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporting_Referents_MDF_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format month name for badges
  const getReportMonthLabel = (dateStr?: string) => {
    if (!dateStr) return 'Mois N/C';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const label = d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      return label.charAt(0).toUpperCase() + label.slice(1);
    } catch {
      return dateStr;
    }
  };

  // Render a single report card item
  const renderReportCard = (report: WeeklyReport) => {
    const monthLabel = getReportMonthLabel(report.semaineLundi || report.createdAt);

    return (
      <div
        key={report.id}
        className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all space-y-3.5"
      >
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <ReportTypeBadge type={report.type} size="sm" />

            <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-xl border border-emerald-200">
              Zone : {report.zone}
            </span>

            <span className="text-[11px] font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-lg border border-teal-200 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-teal-600" />
              <span>{monthLabel}</span>
            </span>

            <PriorityBadge priority={report.priority} urgenceLevel={report.urgenceLevel} size="sm" />

            {report.besoinRetourBureau && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <HelpCircle className="w-3 h-3" />
                <span>Besoin Retour Bureau : OUI</span>
              </span>
            )}

            {report.piecesJointes && report.piecesJointes.length > 0 && (
              <span className="bg-purple-100 text-purple-900 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                <Paperclip className="w-3 h-3 text-purple-700" />
                <span>{report.piecesJointes.length} doc(s)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
              report.status === 'TRAITE'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : report.status === 'EN_COURS'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-blue-100 text-blue-900 border border-blue-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                report.status === 'TRAITE' ? 'bg-emerald-600' : report.status === 'EN_COURS' ? 'bg-amber-600' : 'bg-blue-600'
              }`} />
              {report.status === 'TRAITE' ? 'Traité & Réglé' : report.status === 'EN_COURS' ? 'En cours' : 'Nouveau'}
            </span>

            <span className="text-xs font-semibold text-slate-500">
              {report.semaineLundi ? `Semaine du ${report.semaineLundi}` : new Date(report.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Mini Workflow Stepper inside Card */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
          <ReportingWorkflowStepper report={report} variant="compact" />
        </div>

        {/* Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left: Referent info & Sujet */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Référent de zone</p>
            <p className="text-sm font-bold text-slate-900">{report.referentName}</p>
            <p className="text-xs text-slate-500">{report.email}</p>
            {report.telephone && (
              <p className="text-xs text-slate-500">{report.telephone}</p>
            )}
            
            {report.sujet && (
              <div className="pt-1.5">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Sujet ponctuel :</span>
                <p className="text-xs font-bold text-slate-900 bg-purple-50 p-2 rounded-xl border border-purple-200/70 mt-0.5">
                  {report.sujet}
                </p>
              </div>
            )}

            {report.nouveauxContactes && (
              <div className="text-xs text-emerald-800 font-semibold pt-1">
                <span className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                  + {report.nouveauxContactes}
                </span>
              </div>
            )}
          </div>

          {/* Center: Situations & Activities */}
          <div className="lg:col-span-2 space-y-2">
            {report.situationsPrioritaires && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  {report.type === 'PONCTUEL' ? 'Description du problème :' : 'Situation prioritaire :'}
                </span>
                <p className="text-xs text-slate-800 line-clamp-2 bg-slate-50 p-2 rounded-xl mt-0.5 border border-slate-200/60 font-medium">
                  {report.situationsPrioritaires}
                </p>
              </div>
            )}

            {report.activitesLocales && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Activités locales :</span>
                <p className="text-xs text-slate-700 line-clamp-2 bg-slate-50/70 p-2 rounded-xl mt-0.5 border border-slate-200/60 font-medium">
                  {report.activitesLocales}
                </p>
              </div>
            )}

            {report.besoinRetourBureau && report.detailsDemandeRetour && (
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                <span className="font-bold">Demande au Bureau :</span> {report.detailsDemandeRetour}
              </div>
            )}

            {report.bureauNotes && (
              <div className="bg-emerald-50 p-2.5 rounded-xl border-2 border-emerald-200 text-xs text-emerald-900 font-medium space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1 text-emerald-950">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Retour transmis au référent :</span>
                  </span>
                  {report.reviewedBy && (
                    <span className="text-[10px] text-emerald-700 italic">Par {report.reviewedBy}</span>
                  )}
                </div>
                <p className="pl-4.5 font-semibold text-emerald-950">« {report.bureauNotes} »</p>
              </div>
            )}
          </div>

        </div>

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          {/* Quick status actions for Admin */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Statut :</span>
            
            <button
              onClick={() => onUpdateStatus(report.id, 'NOUVEAU')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                report.status === 'NOUVEAU'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-800'
              }`}
            >
              Nouveau
            </button>

            <button
              onClick={() => onUpdateStatus(report.id, 'EN_COURS')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                report.status === 'EN_COURS'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>En cours</span>
            </button>

            <button
              onClick={() => onUpdateStatus(report.id, 'TRAITE')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                report.status === 'TRAITE'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Traité & Réglé</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenReportDetail(report)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{report.bureauNotes ? 'Modifier / Répondre' : 'Traiter & Répondre'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Voulez-vous supprimer ce reporting ?')) {
                  onDeleteReport(report.id);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Overview */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit']">
              Module Pilotage, Reporting & Coordination des Zones
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Vision objective de l'activité, de la réactivité, de l'état des cas remontés et de l'accompagnement des Référents régionaux.
          </p>
        </div>

        {/* Primary View Switcher: Pilotage vs Gestion des Cas */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setMainTab('PILOTAGE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              mainTab === 'PILOTAGE'
                ? 'bg-emerald-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Tableau de Bord & Pilotage</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('CAS_MANAGEMENT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              mainTab === 'CAS_MANAGEMENT'
                ? 'bg-emerald-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderKanban className="w-4 h-4 text-emerald-400" />
            <span>Gestion des Cas par Zone</span>
          </button>
        </div>
      </div>

      {mainTab === 'PILOTAGE' ? (
        <PilotageDashboardView
          reports={reports}
          customZones={customZones}
          members={members}
          userRole={userRole}
          onOpenReportDetail={onOpenReportDetail}
          onFilterZone={(z) => {
            setSelectedZone(z);
            setMainTab('CAS_MANAGEMENT');
          }}
          onFilterStatus={(s) => {
            setStatusFilter(s);
            setMainTab('CAS_MANAGEMENT');
          }}
          onFilterPriority={(p) => {
            setPriorityFilter(p);
            setMainTab('CAS_MANAGEMENT');
          }}
          onFilterType={(t) => {
            setTypeFilter(t);
            setMainTab('CAS_MANAGEMENT');
          }}
          onNavigateToCasManagement={() => setMainTab('CAS_MANAGEMENT')}
        />
      ) : (
        <>
          {/* Operational Tracking Cycle Banner (Dynamic & Clickable) */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 border border-emerald-500/30 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">
                Cycle Opérationnel de Traitement & Suivi des Signalements
              </h3>
              <p className="text-[11px] text-emerald-300">
                Cliquez sur une étape pour filtrer instantanément les signalements correspondants.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
            {statusFilter === 'ALL' ? 'Tous les statuts' : `Filtre actif : ${statusFilter}`}
          </span>
        </div>

        {/* Visual 4-step interactive flow */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          
          {/* Step 1: Tous / Reporting Envoyé */}
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              statusFilter === 'ALL'
                ? 'bg-white/25 border-emerald-400 ring-2 ring-emerald-400 shadow-sm'
                : 'bg-white/10 border-white/10 hover:bg-white/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-lg font-black flex items-center justify-center text-xs shrink-0 ${
                statusFilter === 'ALL' ? 'bg-emerald-400 text-slate-950' : 'bg-blue-500/30 text-blue-300'
              }`}>
                1
              </span>
              <div>
                <p className="font-bold text-white text-[11px]">Reporting Envoyé</p>
                <p className="text-[10px] text-slate-300">Tous les signalements</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white shrink-0">
              {totalCount}
            </span>
          </button>

          {/* Step 2: Nouveau (Reçu) */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'NOUVEAU' ? 'ALL' : 'NOUVEAU')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              statusFilter === 'NOUVEAU'
                ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400 shadow-sm'
                : 'bg-white/10 border-white/10 hover:bg-white/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-lg font-black flex items-center justify-center text-xs shrink-0 ${
                statusFilter === 'NOUVEAU' ? 'bg-blue-400 text-slate-950' : 'bg-blue-500/30 text-blue-300'
              }`}>
                2
              </span>
              <div>
                <p className="font-bold text-white text-[11px]">Nouveau (Reçu)</p>
                <p className="text-[10px] text-slate-300">En attente d'ouverture</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
              newCount > 0 ? 'bg-blue-500 text-white' : 'bg-white/20 text-slate-300'
            }`}>
              {newCount}
            </span>
          </button>

          {/* Step 3: En cours (Prise en charge) */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'EN_COURS' ? 'ALL' : 'EN_COURS')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              statusFilter === 'EN_COURS'
                ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-400 shadow-sm'
                : 'bg-white/10 border-white/10 hover:bg-white/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-lg font-black flex items-center justify-center text-xs shrink-0 ${
                statusFilter === 'EN_COURS' ? 'bg-amber-400 text-slate-950' : 'bg-amber-500/30 text-amber-300'
              }`}>
                3
              </span>
              <div>
                <p className="font-bold text-white text-[11px]">En cours d'analyse</p>
                <p className="text-[10px] text-slate-300">Actions Bureau</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
              enCoursCount > 0 ? 'bg-amber-500 text-slate-950' : 'bg-white/20 text-slate-300'
            }`}>
              {enCoursCount}
            </span>
          </button>

          {/* Step 4: Traité & Retour Référent */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'TRAITE' ? 'ALL' : 'TRAITE')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              statusFilter === 'TRAITE'
                ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400 shadow-sm'
                : 'bg-white/10 border-white/10 hover:bg-white/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-lg font-black flex items-center justify-center text-xs shrink-0 ${
                statusFilter === 'TRAITE' ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-500/30 text-emerald-300'
              }`}>
                4
              </span>
              <div>
                <p className="font-bold text-white text-[11px]">Traité & Réglé</p>
                <p className="text-[10px] text-slate-300">Réponse transmise</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
              traiteCount > 0 ? 'bg-emerald-500 text-slate-950' : 'bg-white/20 text-slate-300'
            }`}>
              {traiteCount}
            </span>
          </button>

        </div>
      </div>

      {/* Persistence and archive banner */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-950">
              Historique complet des reportings archivé & sauvegardé
            </p>
            <p className="text-[11px] text-emerald-800">
              Tous les reportings périodiques et remontées ponctuelles restent enregistrés avec horodatage de dernière activité.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
          <History className="w-3.5 h-3.5 text-emerald-600" />
          <span>{totalCount} signalements archivés</span>
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Total */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Signalements</p>
          <p className="text-2xl font-black text-slate-900 font-['Outfit']">{totalCount}</p>
          <p className="text-[10px] text-slate-400">Archivés toutes zones</p>
        </div>

        {/* Nouveaux */}
        <div className="bg-white p-4.5 rounded-2xl border border-blue-200 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Nouveaux reçus</p>
          <p className="text-2xl font-black text-blue-900 font-['Outfit']">{newCount}</p>
          <p className="text-[10px] text-blue-600">En attente de lecture</p>
        </div>

        {/* Remontées ponctuelles */}
        <div className="bg-white p-4.5 rounded-2xl border border-purple-200 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Ponctuels actifs</p>
          <p className="text-2xl font-black text-purple-900 font-['Outfit']">{ponctuelCount}</p>
          <p className="text-[10px] text-purple-600">Demandes d'intervention</p>
        </div>

        {/* Besoin Retour Bureau */}
        <div className="bg-white p-4.5 rounded-2xl border border-amber-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Appuis Bureau</p>
            {needBureauCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className="text-2xl font-black text-amber-900 font-['Outfit']">{needBureauCount}</p>
          <p className="text-[10px] text-amber-700">En attente de réponse</p>
        </div>

        {/* Urgences */}
        <div className="bg-white p-4.5 rounded-2xl border border-red-200 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">🔴 Urgences (4-5)</p>
            {urgentCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <p className="text-2xl font-black text-red-900 font-['Outfit']">{urgentCount}</p>
          <p className="text-[10px] text-red-600">Attention immédiate</p>
        </div>

      </div>

      {/* Quick Zone Filter Pills */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Filtrer par Zone</span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('BY_ZONE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'BY_ZONE'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vue par Zones</span>
            </button>

            <button
              onClick={() => setViewMode('FLAT_LIST')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'FLAT_LIST'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vue Liste</span>
            </button>
          </div>
        </div>

        {/* Zone Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedZone('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedZone === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            <span>Toutes les zones</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedZone === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {reports.length}
            </span>
          </button>

          {customZones.map((z) => {
            const count = reportsCountPerZone[z.name] || 0;
            const isSelected = selectedZone.toLowerCase() === z.name.toLowerCase();

            return (
              <button
                key={z.id}
                onClick={() => setSelectedZone(isSelected ? 'ALL' : z.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                }`}
              >
                <span>{z.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Criteria Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-2.5">
          
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par référent, sujet, mot-clé..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Type Filter */}
          <div className="w-full lg:w-40">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="ALL">Tous les types</option>
              <option value="PERIODIQUE">Périodique</option>
              <option value="PONCTUEL">Ponctuel</option>
            </select>
          </div>

          {/* Month / Period Filter Dropdown */}
          <div className="w-full lg:w-38">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="ALL">Tous les mois</option>
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="w-full lg:w-36">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="ALL">Tous statuts</option>
              <option value="NOUVEAU">Nouveau</option>
              <option value="EN_COURS">En cours</option>
              <option value="TRAITE">Traité</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="w-full lg:w-36">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="ALL">Toute priorité</option>
              <option value="NORMAL">🟢 Normal</option>
              <option value="IMPORTANT">🟠 Important</option>
              <option value="URGENT">🔴 Urgent</option>
            </select>
          </div>

          {/* Demande aide Bureau filter */}
          <div className="w-full lg:w-40">
            <select
              value={besoinRetourFilter}
              onChange={(e) => setBesoinRetourFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="ALL">Retour Bureau</option>
              <option value="OUI">Besoin : OUI</option>
              <option value="NON">Besoin : NON</option>
            </select>
          </div>

        </div>

        {/* Active results counter & reset */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
          <span>{filteredReports.length} signalement(s) trouvé(s)</span>
          {(searchQuery || selectedZone !== 'ALL' || selectedMonth !== 'ALL' || typeFilter !== 'ALL' || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || besoinRetourFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedZone('ALL');
                setSelectedMonth('ALL');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setBesoinRetourFilter('ALL');
              }}
              className="text-emerald-700 hover:underline font-bold cursor-pointer"
            >
              Réinitialiser tous les filtres
            </button>
          )}
        </div>
      </div>

      {/* Main Reports Display: BY ZONE or FLAT LIST */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700">Aucun signalement ne correspond aux filtres</h4>
          <p className="text-xs text-slate-500">Modifiez vos critères de recherche pour voir plus de résultats.</p>
        </div>
      ) : viewMode === 'BY_ZONE' ? (
        /* Grouped by Zone */
        <div className="space-y-6">
          {groupedByZone.map(([zoneName, zoneReports]) => {
            const isCollapsed = !!collapsedZones[zoneName];
            const zoneUrgentCount = zoneReports.filter((r) => (r.priority === 'URGENT' || r.urgenceLevel >= 4) && r.status !== 'TRAITE').length;
            const zoneNeedBureauCount = zoneReports.filter((r) => r.besoinRetourBureau && r.status !== 'TRAITE').length;
            const zoneNewCount = zoneReports.filter((r) => r.status === 'NOUVEAU').length;

            // Compute monthly count breakdown for this zone
            const monthsBreakdown: Record<string, number> = {};
            zoneReports.forEach((r) => {
              const label = getReportMonthLabel(r.semaineLundi || r.createdAt);
              monthsBreakdown[label] = (monthsBreakdown[label] || 0) + 1;
            });

            return (
              <div
                key={zoneName}
                className="bg-slate-50/60 rounded-3xl border border-emerald-200 overflow-hidden shadow-sm space-y-3 p-4 sm:p-6"
              >
                {/* Zone Section Header */}
                <div
                  onClick={() => toggleZoneCollapse(zoneName)}
                  className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-2xs cursor-pointer hover:border-emerald-300 transition-all select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit']">
                          Zone : {zoneName}
                        </h3>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full">
                          {zoneReports.length} signalement{zoneReports.length > 1 ? 's' : ''} archivé{zoneReports.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {/* Monthly breakdown badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                          Historique mois :
                        </span>
                        {Object.entries(monthsBreakdown).map(([mLabel, cnt]) => (
                          <span
                            key={mLabel}
                            className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            {mLabel} ({cnt})
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Dernier envoi : {zoneReports[0]?.semaineLundi ? `Semaine du ${zoneReports[0].semaineLundi}` : new Date(zoneReports[0]?.createdAt).toLocaleDateString('fr-FR')} (par {zoneReports[0]?.referentName})
                      </p>
                    </div>
                  </div>

                  {/* Badges and Collapse trigger */}
                  <div className="flex items-center gap-2">
                    {zoneNewCount > 0 && (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200">
                        {zoneNewCount} nouveau{zoneNewCount > 1 ? 'x' : ''}
                      </span>
                    )}

                    {zoneNeedBureauCount > 0 && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-amber-700" />
                        <span>{zoneNeedBureauCount} aide bureau</span>
                      </span>
                    )}

                    {zoneUrgentCount > 0 && (
                      <span className="px-2.5 py-1 bg-red-100 text-red-900 text-xs font-bold rounded-xl border border-red-300 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-red-700" />
                        <span>{zoneUrgentCount} urgent</span>
                      </span>
                    )}

                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all ml-1"
                    >
                      {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Zone Reports List */}
                {!isCollapsed && (
                  <div className="space-y-3 pt-1">
                    {zoneReports.map((report) => renderReportCard(report))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat chronological list */
        <div className="space-y-3">
          {filteredReports.map((report) => renderReportCard(report))}
        </div>
      )}
        </>
      )}

    </div>
  );
};

