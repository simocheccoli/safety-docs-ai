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
  FileText
} from "lucide-react";
import { companyApi } from "@/lib/companyApi";
import { deadlineApi } from "@/lib/deadlineApi";
import { fetchElaborations } from "@/lib/elaborationApi";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { INTERVAL_LABELS } from "@/types/deadline";
import { Elaboration } from "@/types/elaboration";

export default function Dashboard() {
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

  const overdueDeadlines = deadlines.filter(d => d.status === 'overdue');
  const upcomingDeadlines = deadlines
    .filter(d => d.status === 'pending' && d.next_visit_date)
    .sort((a, b) => new Date(a.next_visit_date!).getTime() - new Date(b.next_visit_date!).getTime())
    .slice(0, 5);

  const isLoading = companiesLoading || deadlinesLoading || elaborationsLoading;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return format(new Date(dateStr), "d MMM yyyy", { locale: it });
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
            <Link to="/deadlines">
              <CalendarClock className="h-4 w-4 mr-2" />
              Scadenziario
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

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
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
                  <CardTitle className="text-sm font-medium">Aziende</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companies.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Clienti registrati
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <Link to="/deadlines">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scadenze</CardTitle>
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
                  <CardTitle className="text-sm font-medium">In Ritardo</CardTitle>
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

            <Card className="hover:shadow-md transition-shadow">
              <Link to="/safety-sheets">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Elaborazioni</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{elaborations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Schede di sicurezza
                  </p>
                </CardContent>
              </Link>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Prossime scadenze */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Prossime Scadenze
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/deadlines">
                Vedi tutte
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {deadlinesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessuna scadenza programmata</p>
                <Button asChild variant="link" size="sm" className="mt-1">
                  <Link to="/deadlines">Crea una scadenza</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map(deadline => (
                  <Link 
                    key={deadline.id} 
                    to="/deadlines"
                    className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded bg-primary/10 text-primary shrink-0">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {deadline.company_name} • {formatDate(deadline.next_visit_date)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {INTERVAL_LABELS[deadline.next_visit_interval]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scadenze in ritardo */}
        <Card className={overdueDeadlines.length > 0 ? 'border-destructive/30' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${overdueDeadlines.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              Scadenze in Ritardo
            </CardTitle>
            {overdueDeadlines.length > 0 && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/deadlines?status=overdue">
                  Gestisci
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {deadlinesLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : overdueDeadlines.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <div className="flex items-center justify-center h-10 w-10 mx-auto mb-2 rounded-full bg-green-100 text-green-600">
                  <FileCheck className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-green-600">Tutto in regola!</p>
                <p className="text-xs text-muted-foreground mt-1">Nessuna scadenza in ritardo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueDeadlines.slice(0, 5).map(deadline => (
                  <Link 
                    key={deadline.id} 
                    to="/deadlines"
                    className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded bg-destructive/10 text-destructive shrink-0">
                      <AlertTriangle className="h-5 w-5" />
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Azioni rapide */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/companies">
                <Building2 className="h-6 w-6" />
                <span>Gestisci Aziende</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/deadlines">
                <CalendarClock className="h-6 w-6" />
                <span>Scadenziario</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/dvr">
                <FileCheck className="h-6 w-6" />
                <span>Creazione DVR</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/safety-sheets">
                <FileText className="h-6 w-6" />
                <span>Schede Sicurezza</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
