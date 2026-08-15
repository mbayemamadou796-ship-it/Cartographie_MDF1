import { WeeklyReport, ReportingStatus } from '@shared/types';

const LOCAL_STORAGE_REPORTINGS_KEY = 'mbok_de_france_weekly_reports_v2';

export const INITIAL_WEEKLY_REPORTS: WeeklyReport[] = [
  // AOÛT 2026
  {
    id: 'rep-001',
    referentId: 'usr-modou',
    referentName: 'Modou Mbaye',
    email: 'modou.mbaye@mbokdefrance.org',
    telephone: '06 12 34 56 78',
    zone: 'Bretagne',
    zoneId: 'zone-bretagne',
    type: 'PONCTUEL',
    sujet: 'Logement urgent pour 2 étudiants primo-arrivants à Rennes',
    priority: 'URGENT',
    semaineLundi: '2026-08-10',
    nouveauxContactes: '4 nouveaux membres (étudiants et jeunes actifs à Rennes)',
    situationsPrioritaires: 'Deux nouveaux arrivants ont besoin d\'un accompagnement urgent pour leur recherche de logement étudiant sur Rennes (secteur Beaulieu / Villejean).',
    activitesLocales: 'Organisation de la rencontre d\'accueil mensuelle à Rennes le samedi après-midi. Présentation de l\'association Mbok de France et enregistrement sur la cartographie.',
    besoinRetourBureau: true,
    detailsDemandeRetour: 'Besoin d\'un appui du Bureau pour nous mettre en relation avec d\'éventuels membres ayant des disponibilités de logement temporaire ou contacts bailleurs en Bretagne.',
    urgenceLevel: 4,
    status: 'NOUVEAU',
    createdAt: '2026-08-10T18:45:00.000Z',
    lastActivityAt: '2026-08-10T18:45:00.000Z'
  },
  {
    id: 'rep-002',
    referentId: 'usr-referent-idf',
    referentName: 'Aïssatou Diallo',
    email: 'referent.idf@mbokdefrance.org',
    telephone: '06 98 76 54 32',
    zone: 'Île-de-France',
    zoneId: 'zone-idf',
    type: 'PERIODIQUE',
    sujet: 'Rapport mensuel d\'activité — Août 2026',
    priority: 'NORMAL',
    semaineLundi: '2026-08-03',
    nouveauxContactes: '8 nouveaux contacts recensés',
    situationsPrioritaires: 'Un membre cadre en transition professionnelle sollicite des mises en relation dans le secteur juridique / associatif.',
    activitesLocales: 'Point de coordination des sous-secteurs 75 / 93 / 94. Préparation du forum d\'accueil de rentrée.',
    besoinRetourBureau: false,
    urgenceLevel: 1,
    status: 'TRAITE',
    bureauNotes: 'Rapport validé par le Bureau. Mises en relation effectuées avec la commission insertion.',
    reviewedBy: 'Administrateur MDF',
    reviewedAt: '2026-08-05T10:30:00.000Z',
    createdAt: '2026-08-03T20:15:00.000Z',
    updatedAt: '2026-08-05T10:30:00.000Z',
    lastActivityAt: '2026-08-05T10:30:00.000Z'
  },
  {
    id: 'rep-003',
    referentId: 'usr-referent-aura',
    referentName: 'Amadou Fall',
    email: 'referent.lyon@mbokdefrance.org',
    telephone: '06 45 67 89 01',
    zone: 'Auvergne-Rhône-Alpes',
    zoneId: 'zone-auvergne-rhone-alpes',
    type: 'PONCTUEL',
    sujet: 'Demande de matériel officiel & kits d\'accueil forum de rentrée',
    priority: 'IMPORTANT',
    semaineLundi: '2026-08-03',
    nouveauxContactes: '5 nouveaux adhérents à Lyon & Grenoble',
    situationsPrioritaires: 'Accompagnement d\'une famille en cours d\'installation sur Villeurbanne.',
    activitesLocales: 'Permanence d\'écoute mensuelle à Lyon 7ème et mise à jour des fiches compétences.',
    besoinRetourBureau: true,
    detailsDemandeRetour: 'Demande de flyers et supports MDF officiels pour le stand associatif de septembre à Lyon.',
    urgenceLevel: 3,
    status: 'EN_COURS',
    bureauNotes: 'Colis de flyers en cours de préparation par le pôle communication. Envoi prévu ce jeudi.',
    reviewedBy: 'Secrétariat MDF',
    reviewedAt: '2026-08-06T14:00:00.000Z',
    createdAt: '2026-08-03T19:00:00.000Z',
    updatedAt: '2026-08-06T14:00:00.000Z',
    lastActivityAt: '2026-08-06T14:00:00.000Z'
  },

  // JUILLET 2026
  {
    id: 'rep-004',
    referentId: 'usr-modou',
    referentName: 'Modou Mbaye',
    email: 'modou.mbaye@mbokdefrance.org',
    telephone: '06 12 34 56 78',
    zone: 'Bretagne',
    zoneId: 'zone-bretagne',
    type: 'PERIODIQUE',
    sujet: 'Bilan estival et cartographie des membres en Bretagne',
    priority: 'NORMAL',
    semaineLundi: '2026-07-13',
    nouveauxContactes: '3 nouveaux membres à Brest et Saint-Malo',
    situationsPrioritaires: 'Un étudiant ingénieur recherche un stage de fin d\'études en télécoms.',
    activitesLocales: 'Barbecue d\'été convivial des membres bretons organisé au parc du Thabor à Rennes. 18 participants.',
    besoinRetourBureau: false,
    urgenceLevel: 1,
    status: 'TRAITE',
    bureauNotes: 'Félicitations pour cette belle initiative estivale ! CV transmis au réseau alumni.',
    reviewedBy: 'Présidence MDF',
    reviewedAt: '2026-07-16T11:20:00.000Z',
    createdAt: '2026-07-13T21:10:00.000Z',
    updatedAt: '2026-07-16T11:20:00.000Z',
    lastActivityAt: '2026-07-16T11:20:00.000Z'
  },
  {
    id: 'rep-005',
    referentId: 'usr-referent-idf',
    referentName: 'Aïssatou Diallo',
    email: 'referent.idf@mbokdefrance.org',
    telephone: '06 98 76 54 32',
    zone: 'Île-de-France',
    zoneId: 'zone-idf',
    type: 'PONCTUEL',
    sujet: 'Validation budgétaire location de salle séminaire IDF',
    priority: 'IMPORTANT',
    semaineLundi: '2026-07-06',
    nouveauxContactes: '12 nouveaux contacts (diplômés et entrepreneurs)',
    situationsPrioritaires: 'Mise en place d\'un mentorat pour 3 primo-arrivants boursiers.',
    activitesLocales: 'Atelier CV et préparation aux entretiens d\'embauche en visioconférence.',
    besoinRetourBureau: true,
    detailsDemandeRetour: 'Validation budgétaire pour la location d\'une salle à Paris pour le séminaire d\'octobre.',
    urgenceLevel: 3,
    status: 'TRAITE',
    bureauNotes: 'Budget de réservation de salle validé par la trésorerie MDF.',
    reviewedBy: 'Trésorier MDF',
    reviewedAt: '2026-07-09T16:45:00.000Z',
    createdAt: '2026-07-06T18:30:00.000Z',
    updatedAt: '2026-07-09T16:45:00.000Z',
    lastActivityAt: '2026-07-09T16:45:00.000Z'
  },
  {
    id: 'rep-006',
    referentId: 'usr-referent-hdf',
    referentName: 'Ousmane Ndiaye',
    email: 'referent.lille@mbokdefrance.org',
    telephone: '06 77 88 99 00',
    zone: 'Hauts-de-France',
    zoneId: 'zone-hauts-de-france',
    type: 'PONCTUEL',
    sujet: 'Soutien urgent & visite hospitalière membre MDF Lille',
    priority: 'URGENT',
    semaineLundi: '2026-07-20',
    nouveauxContactes: '6 nouveaux membres dans la métropole lilloise',
    situationsPrioritaires: 'Signalement d\'un membre hospitalisé nécessitant des visites de soutien fraternelles.',
    activitesLocales: 'Visites de soutien organisées et accueil des nouveaux arrivants à Lille Flandres.',
    besoinRetourBureau: true,
    detailsDemandeRetour: 'Soutien moral et prise de contact par un membre du Bureau.',
    urgenceLevel: 5,
    status: 'TRAITE',
    bureauNotes: 'Contact téléphonique établi par le responsable solidarité. Visite effectuée.',
    reviewedBy: 'Pôle Solidarité MDF',
    reviewedAt: '2026-07-21T10:00:00.000Z',
    createdAt: '2026-07-20T17:00:00.000Z',
    updatedAt: '2026-07-21T10:00:00.000Z',
    lastActivityAt: '2026-07-21T10:00:00.000Z'
  }
];

export class ReportingService {
  static getPriorityFromUrgence(urgenceLevel: number): 'NORMAL' | 'IMPORTANT' | 'URGENT' {
    if (urgenceLevel >= 4) return 'URGENT';
    if (urgenceLevel === 3) return 'IMPORTANT';
    return 'NORMAL';
  }

  static getReports(): WeeklyReport[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_REPORTINGS_KEY) || localStorage.getItem('mbok_de_france_weekly_reports_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, WeeklyReport>();
          
          INITIAL_WEEKLY_REPORTS.forEach((r) => {
            const enriched = {
              ...r,
              priority: r.priority || this.getPriorityFromUrgence(r.urgenceLevel),
              type: r.type || 'PERIODIQUE',
              lastActivityAt: r.lastActivityAt || r.updatedAt || r.createdAt
            };
            map.set(r.id, enriched);
          });
          
          parsed.forEach((r: WeeklyReport) => {
            const enriched = {
              ...r,
              priority: r.priority || this.getPriorityFromUrgence(r.urgenceLevel || 1),
              type: r.type || 'PERIODIQUE',
              lastActivityAt: r.lastActivityAt || r.updatedAt || r.createdAt
            };
            map.set(r.id, enriched);
          });

          const merged = Array.from(map.values()).sort((a, b) => {
            return (b.lastActivityAt || b.createdAt || '').localeCompare(a.lastActivityAt || a.createdAt || '');
          });

          return merged;
        }
      }
    } catch (e) {
      console.error('Erreur chargement reports:', e);
    }

    return INITIAL_WEEKLY_REPORTS.map(r => ({
      ...r,
      priority: r.priority || this.getPriorityFromUrgence(r.urgenceLevel),
      type: r.type || 'PERIODIQUE',
      lastActivityAt: r.lastActivityAt || r.updatedAt || r.createdAt
    }));
  }

  static saveReports(reports: WeeklyReport[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_REPORTINGS_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error('Erreur sauvegarde reports:', e);
    }
  }

  static addReport(reportData: Omit<WeeklyReport, 'id' | 'createdAt' | 'status'>): WeeklyReport {
    const reports = this.getReports();
    const now = new Date().toISOString();
    const calculatedPriority = reportData.priority || this.getPriorityFromUrgence(reportData.urgenceLevel || 1);

    const newReport: WeeklyReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      status: 'NOUVEAU',
      type: reportData.type || 'PERIODIQUE',
      priority: calculatedPriority,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now
    };
    const updated = [newReport, ...reports];
    this.saveReports(updated);
    return newReport;
  }

  static updateReportStatus(
    reportId: string, 
    status: ReportingStatus, 
    bureauNotes?: string, 
    reviewerName?: string
  ): WeeklyReport[] {
    const reports = this.getReports();
    const now = new Date().toISOString();
    const updated = reports.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          status,
          bureauNotes: bureauNotes !== undefined ? bureauNotes : r.bureauNotes,
          reviewedBy: reviewerName || r.reviewedBy,
          reviewedAt: now,
          updatedAt: now,
          lastActivityAt: now
        };
      }
      return r;
    });
    this.saveReports(updated);
    return updated;
  }

  static deleteReport(reportId: string): WeeklyReport[] {
    const reports = this.getReports();
    const updated = reports.filter((r) => r.id !== reportId);
    this.saveReports(updated);
    return updated;
  }
}

