import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardSkeleton } from "@/components/ui/loading-skeletons";
import { DeadlineCard } from "@/components/deadline/DeadlineCard";
import { DeadlineDialog } from "@/components/deadline/DeadlineDialog";
import { QuickCompanyDialog } from "@/components/deadline/QuickCompanyDialog";
import { deadlineApi } from "@/lib/deadlineApi";
import { companyApi } from "@/lib/companyApi";
import { Deadline, CreateDeadlineData } from "@/types/deadline";
import { CreateCompanyData } from "@/types/company";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Calendar, List, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

export default function Deadlines() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "overdue">("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickCompanyDialogOpen, setQuickCompanyDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | undefined>();

  const { data: deadlines = [], isLoading: deadlinesLoading } = useQuery({
    queryKey: ['deadlines'],
    queryFn: deadlineApi.getAll,
  });

  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companyApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: ({ data, companyName }: { data: CreateDeadlineData; companyName?: string }) => 
      deadlineApi.create(data, companyName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast({ title: "Scadenza creata con successo" });
    },
    onError: () => {
      toast({ title: "Errore nella creazione", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, companyName }: { id: number; data: Partial<CreateDeadlineData>; companyName?: string }) => 
      deadlineApi.update(id, data, companyName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast({ title: "Scadenza aggiornata con successo" });
    },
    onError: () => {
      toast({ title: "Errore nell'aggiornamento", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deadlineApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast({ title: "Scadenza eliminata" });
    },
    onError: () => {
      toast({ title: "Errore nell'eliminazione", variant: "destructive" });
    }
  });

  const completeMutation = useMutation({
    mutationFn: deadlineApi.markCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast({ title: "Visita completata! Prossima scadenza aggiornata." });
    },
    onError: () => {
      toast({ title: "Errore nel completamento", variant: "destructive" });
    }
  });

  const createCompanyMutation = useMutation({
    mutationFn: companyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({ title: "Azienda creata con successo" });
    },
    onError: () => {
      toast({ title: "Errore nella creazione azienda", variant: "destructive" });
    }
  });

  const filteredDeadlines = useMemo(() => {
    return deadlines.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
      const matchesCompany = filterCompany === 'all' || d.company_id.toString() === filterCompany;
      
      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [deadlines, searchQuery, filterStatus, filterCompany]);

  const overdueCount = deadlines.filter(d => d.status === 'overdue').length;

  const handleSave = async (data: CreateDeadlineData, companyName?: string) => {
    if (editingDeadline) {
      await updateMutation.mutateAsync({ id: editingDeadline.id, data, companyName });
    } else {
      await createMutation.mutateAsync({ data, companyName });
    }
  };

  const handleEdit = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setDialogOpen(true);
  };

  const handleCreateCompany = async (data: CreateCompanyData) => {
    await createCompanyMutation.mutateAsync(data);
  };

  const openNewDialog = () => {
    setEditingDeadline(undefined);
    setDialogOpen(true);
  };

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startPadding = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  const paddedDays = Array(startPadding).fill(null).concat(daysInMonth);

  const getDeadlinesForDay = (day: Date) => {
    return deadlines.filter(d => {
      if (d.next_visit_date) {
        return isSameDay(new Date(d.next_visit_date), day);
      }
      return false;
    });
  };

  const isLoading = deadlinesLoading || companiesLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Scadenziario</h1>
          <p className="text-muted-foreground">
            Gestisci appuntamenti e scadenze con i clienti
          </p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nuova Scadenza
        </Button>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            {overdueCount} {overdueCount === 1 ? 'scadenza' : 'scadenze'} in ritardo
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per titolo, azienda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="pending">In attesa</SelectItem>
            <SelectItem value="overdue">Scaduti</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCompany} onValueChange={setFilterCompany}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Azienda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le aziende</SelectItem>
            {companies.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredDeadlines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nessuna scadenza trovata</p>
              <Button variant="link" onClick={openNewDialog} className="mt-2">
                Crea la prima scadenza
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredDeadlines.map(deadline => (
                <DeadlineCard
                  key={deadline.id}
                  deadline={deadline}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onComplete={(id) => completeMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: it })}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
                <div key={day} className="bg-muted p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {paddedDays.map((day, index) => {
                if (!day) {
                  return <div key={`pad-${index}`} className="bg-card p-2 min-h-[80px]" />;
                }
                
                const dayDeadlines = getDeadlinesForDay(day);
                const isToday = isSameDay(day, new Date());
                const hasOverdue = dayDeadlines.some(d => d.status === 'overdue');
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`bg-card p-2 min-h-[80px] ${!isSameMonth(day, currentMonth) ? 'opacity-50' : ''}`}
                  >
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                      isToday ? 'bg-primary text-primary-foreground font-bold' : ''
                    }`}>
                      {format(day, 'd')}
                    </span>
                    
                    <div className="mt-1 space-y-1">
                      {dayDeadlines.slice(0, 2).map(d => (
                        <div 
                          key={d.id}
                          className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                            d.status === 'overdue' 
                              ? 'bg-destructive/20 text-destructive' 
                              : 'bg-primary/20 text-primary'
                          }`}
                          onClick={() => handleEdit(d)}
                        >
                          {d.title}
                        </div>
                      ))}
                      {dayDeadlines.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayDeadlines.length - 2} altro
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DeadlineDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deadline={editingDeadline}
        companies={companies}
        onSave={handleSave}
        onQuickCreateCompany={() => setQuickCompanyDialogOpen(true)}
      />

      <QuickCompanyDialog
        open={quickCompanyDialogOpen}
        onOpenChange={setQuickCompanyDialogOpen}
        onSave={handleCreateCompany}
      />
    </div>
  );
}
