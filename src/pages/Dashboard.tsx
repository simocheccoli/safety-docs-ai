import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  CalendarClock, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Plus,
  Calendar,
  FileText,
  ShieldCheck,
  FlaskConical,
  FileWarning,
  Users,
  TrendingUp
} from "lucide-react";
import { companyApi } from "@/lib/companyApi";
import { deadlineApi } from "@/lib/deadlineApi";
import { fetchElaborations } from "@/lib/elaborationApi";
import { dvrApi } from "@/lib/dvrApi";
import { getRiskTypes } from "@/lib/riskApi";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { INTERVAL_LABELS } from "@/types/deadline";
import { Elaboration } from "@/types/elaboration";
import { DVR } from "@/types/dvr";

export default function Dashboard() {
  // Fetch all data sources
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companyApi.getAll,
  });

  const { data: deadlines = [], isLoading: deadlinesLoading } = useQuery({
    queryKey: ['deadlines'],
    queryFn: deadlineApi.getAll,
  });

  const { data: elaborations = [], isLoading: elaborationsLoading } = useQuery<Elaboration[]>({
    queryKey: ['elaborations'],
    queryFn: fetchElaborations,
  });

  const { data: dvrs = [], isLoading: dvrsLoading } = useQuery<DVR[]>({
    queryKey: ['dvrs'],
    queryFn: dvrApi.getDVRList,
  });

  const { data: risks = [], isLoading: risksLoading } = useQuery({
    queryKey: ['risks'],
    queryFn: getRiskTypes,
  });

  // Calculate statistics
  const overdueDeadlines = deadlines.filter(d => d.status === 'overdue');
  const upcomingDeadlines = deadlines
    .filter(d => d.status === 'pending' && d.next_visit_date)
    .sort((a, b) => new Date(a.next_visit_date!).getTime() - new Date(b.next_visit_date!).getTime())
    .slice(0, 5);

  const dvrDrafts = dvrs.filter(d => d.stato === 'BOZZA');
  const dvrFinalized = dvrs.filter(d => d.stato === 'FINALIZZATO');
  const activeRisks = risks.filter(r => r.status === 'active');
  
  // Get recent elaborations
  const recentElaborations = [...elaborations]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  // Get recent DVRs
  const recentDVRs = [...dvrs]
    .sort((a, b) => new Date(b.data_ultima_modifica || 0).getTime() - new Date(a.data_ultima_modifica || 0).getTime())
    .slice(0, 5);

  const isLoading = companiesLoading || deadlinesLoading || elaborationsLoading || dvrsLoading || risksLoading;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return format(new Date(dateStr), "d MMM yyyy", { locale: it });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'BOZZA':
        return <Badge variant="secondary">Bozza</Badge>;
      case 'IN_REVISIONE':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">In revisione</Badge>;
      case 'FINALIZZATO':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Finalizzato</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Panoramica delle attività HSEB5
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/companies">
              <Plus className="h-4 w-4 mr-2" />
              Nuova Azienda
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dvr/wizard">
              <FileCheck className="h-4 w-4 mr-2" />
              Nuovo DVR
            </Link>
          </Button>
        </div>
      </div>

      {/* Alert scadenze in ritardo */}
      {overdueDeadlines.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-destructive">
              {overdueDeadlines.length} {overdueDeadlines.length === 1 ? 'scadenza' : 'scadenze'} in ritardo
            </p>
            <p className="text-sm text-muted-foreground">
              Ci sono visite non ancora effettuate oltre la data prevista
            </p>
          </div>
          <Button asChild variant="destructive" size="sm">
            <Link to="/deadlines?status=overdue">
              Vedi tutte
            </Link>
          </Button>
        </div>
      )}

      {/* Alert DVR in bozza */}
      {dvrDrafts.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <FileWarning className="h-5 w-5 text-yellow-600 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-yellow-700">
              {dvrDrafts.length} DVR in bozza
            </p>
            <p className="text-sm text-muted-foreground">
              Documenti da completare e finalizzare
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
            <Link to="/dvr">
              Gestisci
            </Link>
          </Button>
        </div>
      )}

      {/* Stats cards - 6 cards in 2 rows */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <Link to="/companies">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aziende Clienti</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companies.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Clienti registrati in piattaforma
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <Link to="/dvr">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documenti DVR</CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dvrs.length}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{dvrDrafts.length} bozze</span>
                    <span className="text-xs text-green-600">{dvrFinalized.length} finalizzati</span>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <Link to="/risk-management">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tipologie Rischio</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{risks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeRisks.length} attive per analisi AI
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <Link to="/safety-sheets">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Schede Sicurezza</CardTitle>
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{elaborations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Elaborazioni prodotti chimici
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <Link to="/deadlines">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scadenze Attive</CardTitle>
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{deadlines.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Appuntamenti programmati
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className={`hover:shadow-md transition-shadow ${overdueDeadlines.length > 0 ? 'border-destructive/50' : ''}`}>
              <Link to="/deadlines?status=overdue">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scadenze in Ritardo</CardTitle>
                  <AlertTriangle className={`h-4 w-4 ${overdueDeadlines.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${overdueDeadlines.length > 0 ? 'text-destructive' : ''}`}>
                    {overdueDeadlines.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Visite da completare
                  </p>
                </CardContent>
              </Link>
            </Card>
          </>
        )}
      </div>

      {/* Main content grid - 3 columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Prossime scadenze */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Prossime Scadenze
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/deadlines">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {deadlinesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessuna scadenza</p>
                <Button asChild variant="link" size="sm" className="mt-1">
                  <Link to="/deadlines">Crea una scadenza</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map(deadline => (
                  <Link 
                    key={deadline.id} 
                    to="/deadlines"
                    className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded bg-primary/10 text-primary shrink-0">
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {deadline.company_name} • {formatDate(deadline.next_visit_date)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ultimi DVR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              Ultimi DVR
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dvr">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {dvrsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentDVRs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessun DVR</p>
                <Button asChild variant="link" size="sm" className="mt-1">
                  <Link to="/dvr/wizard">Crea un DVR</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDVRs.map(dvr => (
                  <Link 
                    key={dvr.id} 
                    to={`/dvr/${dvr.id}`}
                    className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded bg-blue-100 text-blue-600 shrink-0">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{dvr.nome}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          Rev. {dvr.numero_revisione}
                        </p>
                        {getStatusBadge(dvr.stato)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ultime Schede Sicurezza */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              Ultime Schede
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/safety-sheets">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {elaborationsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentElaborations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessuna scheda</p>
                <Button asChild variant="link" size="sm" className="mt-1">
                  <Link to="/safety-sheets">Carica scheda</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentElaborations.map(elab => (
                  <Link 
                    key={elab.id} 
                    to={`/safety-sheets/${elab.id}`}
                    className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded bg-purple-100 text-purple-600 shrink-0">
                      <FlaskConical className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{elab.title || 'Elaborazione'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {elab.company_name || 'Azienda'} • {formatDate(elab.created_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scadenze in ritardo - full width if there are any */}
      {overdueDeadlines.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Scadenze in Ritardo
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/deadlines?status=overdue">
                Gestisci
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {overdueDeadlines.slice(0, 6).map(deadline => (
                <Link 
                  key={deadline.id} 
                  to="/deadlines"
                  className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 hover:bg-destructive/10 transition-colors"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded bg-destructive/10 text-destructive shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{deadline.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {deadline.company_name} • Scaduto: {formatDate(deadline.next_visit_date)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Azioni rapide */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Azioni Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1.5">
              <Link to="/companies">
                <Building2 className="h-5 w-5" />
                <span className="text-xs">Aziende</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1.5">
              <Link to="/dvr">
                <FileCheck className="h-5 w-5" />
                <span className="text-xs">DVR</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1.5">
              <Link to="/risk-management">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs">Rischi</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1.5">
              <Link to="/safety-sheets">
                <FlaskConical className="h-5 w-5" />
                <span className="text-xs">Schede</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1.5">
              <Link to="/deadlines">
                <CalendarClock className="h-5 w-5" />
                <span className="text-xs">Scadenziario</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
