import React, { useState } from 'react';
import { WeeklyReport, AppUser, CustomZone, UserRole, ReportingStatus } from '@shared/types';
import { ReferentReportingForm } from './ReferentReportingForm';
import { AdminReportingView } from './AdminReportingView';
import { ReportDetailModal } from './ReportDetailModal';
import { Calendar, LayoutDashboard, Send, ArrowLeft } from 'lucide-react';

interface ReportingsViewProps {
  reports: WeeklyReport[];
  currentUser: AppUser | null;
  customZones: CustomZone[];
  userRole: UserRole;
  onSubmitReport: (reportData: Omit<WeeklyReport, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateStatus: (reportId: string, status: ReportingStatus, bureauNotes?: string) => void;
  onDeleteReport: (reportId: string) => void;
}

export const ReportingsView: React.FC<ReportingsViewProps> = ({
  reports,
  currentUser,
  customZones,
  userRole,
  onSubmitReport,
  onUpdateStatus,
  onDeleteReport
}) => {
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'form'>('dashboard');

  // Filter reports submitted by current referent (or matching email / id)
  const myReports = reports.filter((r) => {
    if (r.referentId === currentUser?.id) return true;
    if (currentUser?.email && r.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (currentUser?.name && r.referentName.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  });

  const handleOpenReportDetail = (report: WeeklyReport) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <div className="space-y-6">
      
      {/* If Admin wants to switch to Referent Form for manual input/testing */}
      {userRole === 'admin' && adminViewMode === 'form' && (
        <div className="flex items-center justify-between bg-emerald-100/60 p-3.5 px-5 rounded-2xl border border-emerald-300">
          <span className="text-xs font-bold text-emerald-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Mode saisie reporting (Vue Référent de zone)
          </span>
          <button
            onClick={() => setAdminViewMode('dashboard')}
            className="px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au tableau de bord des remontées</span>
          </button>
        </div>
      )}

      {/* Render depending on role and mode */}
      {userRole === 'referent' || (userRole === 'admin' && adminViewMode === 'form') ? (
        <ReferentReportingForm
          currentUser={currentUser}
          customZones={customZones}
          myReports={myReports}
          onSubmitReport={(data) => {
            onSubmitReport(data);
            if (userRole === 'admin') {
              setAdminViewMode('dashboard');
            }
          }}
          onOpenReportDetail={handleOpenReportDetail}
        />
      ) : (
        <AdminReportingView
          reports={reports}
          customZones={customZones}
          userRole={userRole}
          onOpenReportDetail={handleOpenReportDetail}
          onUpdateStatus={onUpdateStatus}
          onDeleteReport={onDeleteReport}
          onOpenNewReportForm={() => setAdminViewMode('form')}
        />
      )}

      {/* Detail & Response Modal */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={isDetailModalOpen}
        userRole={userRole}
        currentUserName={currentUser?.name}
        onClose={handleCloseDetail}
        onUpdateStatus={(id, status, notes) => {
          onUpdateStatus(id, status, notes);
          if (selectedReport && selectedReport.id === id) {
            setSelectedReport({
              ...selectedReport,
              status,
              bureauNotes: notes !== undefined ? notes : selectedReport.bureauNotes
            });
          }
        }}
        onDelete={(id) => {
          onDeleteReport(id);
          handleCloseDetail();
        }}
      />

    </div>
  );
};
