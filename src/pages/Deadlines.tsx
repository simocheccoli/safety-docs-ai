import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CardSkeleton } from "@/components/ui/loading-skeletons";
import { DeadlineCard } from "@/components/deadline/DeadlineCard";
import { DeadlineDialog } from "@/components/deadline/DeadlineDialog";
import { DeadlineEditSheet } from "@/components/deadline/DeadlineEditSheet";
import { QuickCompanyDialog } from "@/components/deadline/QuickCompanyDialog";
import { CompleteValidationDialog } from "@/components/deadline/CompleteValidationDialog";
import { CompleteDeadlineData } from "@/types/deadlineValidation";
import { deadlineApi } from "@/lib/deadlineApi";
import { companyApi } from "@/lib/companyApi";
import { getRiskTypes } from "@/lib/riskApi";
import { Deadline, CreateDeadlineData } from "@/types/deadline";
import { CreateCompanyData } from "@/types/company";
import { toast } from "@/hooks/use-toast";
import { useListPagination } from "@/hooks/useListPagination";
import { exportToCSV, exportToExcel } from "@/utils/exportUtils";
import { Plus, Search, Calendar, List, ChevronLeft, ChevronRight, AlertTriangle, Download, ChevronDown, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Deadlines() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "overdue">("all");
  const [filterCompanies, setFilterCompanies] = useState<Set<number>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickCompanyDialogOpen, setQuickCompanyDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | undefined>();
  const [editingDeadlineSheetOpen, setEditingDeadlineSheetOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completingDeadline, setCompletingDeadline] = useState<Deadline | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deadlineToDelete, setDeadlineToDelete] = useState<number | null>(null);

  const { data: deadlines = [], isLoading: deadlinesLoading } = useQuery({
    queryKey: ['deadlines'],
    queryFn: deadlineApi.getAll,
  });

  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companyApi.getAll,
  });

  const { data: allRiskTypes = [], isLoading: riskTypesLoading } = useQuery({
    queryKey: ['risks'],
    queryFn: getRiskTypes,
  });

  // Filtra solo i tipi di rischio attivi
  const riskTypes = useMemo(() => {
    return allRiskTypes.filter(rt => rt.status === 'active');
  }, [allRiskTypes]);

  const createMutation = useMutation({
    mutationFn: ({ data, companyName, riskTypeName }: { data: CreateDeadlineData; companyName?: string; riskTypeName?: string }) => 
      deadlineApi.create(data, companyName, riskTypeName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast({ title: "Scadenza creata con successo" });
    },
    onError: () => {
      toast({ title: "Errore nella creazione", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, companyName, riskTypeName }: { id: number; data: Partial<CreateDeadlineData>; companyName?: string; riskTypeName?: string }) => 
      deadlineApi.update(id, data, companyName, riskTypeName),
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
    mutationFn: ({ id, data }: { id: number; data?: CompleteDeadlineData }) => deadlineApi.markCompleted(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast({ title: "Valutazione completata! Prossima scadenza aggiornata." });
      setCompleteDialogOpen(false);
      setCompletingDeadline(undefined);
    },
    onError: () => {
      toast({ title: "Errore nel completamento", variant: "destructive" });
    }
  });

  const handleCompleteClick = (deadline: Deadline) => {
    setCompletingDeadline(deadline);
    setCompleteDialogOpen(true);
  };

  const handleCompleteValidation = async (data: CompleteDeadlineData) => {
    if (!completingDeadline) return;
    await completeMutation.mutateAsync({ id: completingDeadline.id, data });
  };

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
      const matchesCompany = filterCompanies.size === 0 || filterCompanies.has(d.company_id);
      
      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [deadlines, searchQuery, filterStatus, filterCompanies]);

  // Usa hook per paginazione e selezione (solo per vista lista)
  const {
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    totalPages,
    paginatedItems: paginatedDeadlines,
    startIndex,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    hasSelection,
    getSelectedItems,
  } = useListPagination(filteredDeadlines, 10);

  const overdueCount = deadlines.filter(d => d.status === 'overdue').length;

  const handleCreate = async (data: CreateDeadlineData, companyName?: string, riskTypeName?: string) => {
    await createMutation.mutateAsync({ data, companyName, riskTypeName });
  };

  const handleUpdate = async (id: number, data: CreateDeadlineData, companyName?: string, riskTypeName?: string) => {
    await updateMutation.mutateAsync({ id, data, companyName, riskTypeName });
  };

  const handleEdit = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setEditingDeadlineSheetOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeadlineToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deadlineToDelete !== null) {
      deleteMutation.mutate(deadlineToDelete);
      setDeleteDialogOpen(false);
      setDeadlineToDelete(null);
    }
  };

  const handleCreateCompany = async (data: CreateCompanyData) => {
    await createCompanyMutation.mutateAsync(data);
  };

  const openNewDialog = () => {
    setEditingDeadline(undefined);
    setDialogOpen(true);
  };

  // Funzioni export
  const formatDeadlineDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: it });
  };

  const handleExportCSV = () => {
    exportToCSV(
      paginatedDeadlines,
      ['Titolo', 'Azienda', 'Tipo Rischio', 'Data Ultima Validazione', 'Data Prossima Validazione', 'Stato'],
      (deadline) => [
        deadline.title || '',
        deadline.company_name || '',
        deadline.risk_type_name || '',
        formatDeadlineDate(deadline.last_validation_date),
        formatDeadlineDate(deadline.next_validation_date),
        deadline.status || '',
      ],
      'scadenze'
    );
    toast({ title: 'Successo', description: 'File CSV esportato con successo' });
  };

  const handleExportExcel = async () => {
    await exportToExcel(
      paginatedDeadlines,
      ['Titolo', 'Azienda', 'Tipo Rischio', 'Data Ultima Validazione', 'Data Prossima Validazione', 'Stato'],
      (deadline) => [
        deadline.title || '',
        deadline.company_name || '',
        deadline.risk_type_name || '',
        formatDeadlineDate(deadline.last_validation_date),
        formatDeadlineDate(deadline.next_validation_date),
        deadline.status || '',
      ],
      'scadenze'
    );
    toast({ title: 'Successo', description: 'File Excel esportato con successo' });
  };

  const handleExportSelected = async () => {
    const selected = getSelectedItems();
    if (selected.length === 0) return;

    await exportToExcel(
      selected,
      ['Titolo', 'Azienda', 'Tipo Rischio', 'Data Ultima Validazione', 'Data Prossima Validazione', 'Stato'],
      (deadline) => [
        deadline.title || '',
        deadline.company_name || '',
        deadline.risk_type_name || '',
        formatDeadlineDate(deadline.last_validation_date),
        formatDeadlineDate(deadline.next_validation_date),
        deadline.status || '',
      ],
      `scadenze_selezionate_${selected.length}`
    );
    toast({ title: 'Successo', description: `${selected.length} elementi esportati con successo` });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setCurrentPage(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(<PaginationEllipsis key="ellipsis-1" />);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationEllipsis key="ellipsis-2" />);
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startPadding = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  const paddedDays = Array(startPadding).fill(null).concat(daysInMonth);

  const getDeadlinesForDay = (day: Date) => {
    return filteredDeadlines.filter(d => {
      if (d.next_validation_date) {
        return isSameDay(new Date(d.next_validation_date), day);
      }
      return false;
    });
  };

  const isLoading = deadlinesLoading || companiesLoading || riskTypesLoading;

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
          Pianifica Valutazione
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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-between">
              <span className="truncate">
                {filterCompanies.size === 0
                  ? "Tutte le aziende"
                  : filterCompanies.size === 1
                  ? companies.find(c => filterCompanies.has(c.id))?.name || "1 azienda"
                  : `${filterCompanies.size} aziende`}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="max-h-[300px] overflow-y-auto p-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer" onClick={() => setFilterCompanies(new Set())}>
                  <Checkbox checked={filterCompanies.size === 0} />
                  <label className="text-sm font-medium cursor-pointer flex-1">Tutte le aziende</label>
                </div>
                {companies.map(c => {
                  const isChecked = filterCompanies.has(c.id);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                      onClick={() => {
                        const newSet = new Set(filterCompanies);
                        if (isChecked) {
                          newSet.delete(c.id);
                        } else {
                          newSet.add(c.id);
                        }
                        setFilterCompanies(newSet);
                      }}
                    >
                      <Checkbox checked={isChecked} />
                      <label className="text-sm cursor-pointer flex-1 truncate">{c.name}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {view === 'list' && (
          <>
            {/* Toggle Vista Card/Table */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>

            {/* Select Elementi per Pagina */}
            <Select value={perPage.toString()} onValueChange={(value) => setPerPage(Number(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per pagina</SelectItem>
                <SelectItem value="25">25 per pagina</SelectItem>
                <SelectItem value="50">50 per pagina</SelectItem>
                <SelectItem value="100">100 per pagina</SelectItem>
              </SelectContent>
            </Select>

            {/* Dropdown Esporta */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Esporta
                  {hasSelection && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedIds.size}
                    </Badge>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  Esporta CSV (pagina corrente)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>
                  Esporta Excel (pagina corrente)
                </DropdownMenuItem>
                {hasSelection && (
                  <DropdownMenuItem onClick={handleExportSelected}>
                    Esporta selezionati ({selectedIds.size})
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
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
          ) : viewMode === 'card' ? (
            <div className="grid gap-4 md:grid-cols-2">
              {paginatedDeadlines.map(deadline => (
                <DeadlineCard
                  key={deadline.id}
                  deadline={deadline}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onComplete={(id) => {
                    const deadline = deadlines.find(d => d.id === id);
                    if (deadline) handleCompleteClick(deadline);
                  }}
                  riskTypes={riskTypes}
                />
              ))}
            </div>
          ) : (
            <>
              <div className="bg-card border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-medium">Titolo</TableHead>
                      <TableHead className="font-medium">Azienda</TableHead>
                      <TableHead className="font-medium">Tipo Rischio</TableHead>
                      <TableHead className="font-medium">Data Ultima Validazione</TableHead>
                      <TableHead className="font-medium">Data Prossima Validazione</TableHead>
                      <TableHead className="font-medium">Stato</TableHead>
                      <TableHead className="text-right font-medium">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDeadlines.map((deadline) => (
                      <TableRow key={deadline.id} className="hover:bg-muted/20">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(deadline.id)}
                            onCheckedChange={() => toggleSelection(deadline.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{deadline.title}</TableCell>
                        <TableCell>
                          {deadline.company_name || '-'}
                          {deadline.company_branch_name && ` (${deadline.company_branch_name})`}
                        </TableCell>
                        <TableCell>
                          {deadline.risk_type_id 
                            ? riskTypes.find(r => r.id === deadline.risk_type_id)?.name || '-'
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{formatDeadlineDate(deadline.last_validation_date)}</TableCell>
                        <TableCell>{formatDeadlineDate(deadline.next_validation_date)}</TableCell>
                        <TableCell>
                          <Badge variant={deadline.status === 'overdue' ? 'destructive' : 'secondary'}>
                            {deadline.status === 'overdue' ? 'Scaduto' : deadline.status === 'pending' ? 'In attesa' : '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(deadline)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(deadline.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {deadline.status !== 'completed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCompleteClick(deadline)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginazione */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {renderPaginationItems()}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              {/* Info paginazione */}
              {filteredDeadlines.length > 0 && (
                <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                  <div>
                    Mostrando {startIndex + 1} - {Math.min(startIndex + perPage, filteredDeadlines.length)} di {filteredDeadlines.length} scadenze
                  </div>
                  {hasSelection && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {selectedIds.size} selezionati
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Deseleziona tutti
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
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
                          className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                            d.status === 'overdue' 
                              ? 'bg-destructive/20 text-destructive' 
                              : 'bg-primary/20 text-primary'
                          }`}
                          onClick={() => handleEdit(d)}
                          title={`${d.title}${d.company_name ? ` - ${d.company_name}` : ''}`}
                        >
                          <div className="truncate font-medium">{d.title}</div>
                          {d.company_name && (
                            <div className="truncate text-[10px] opacity-80 mt-0.5">
                              {d.company_name}
                            </div>
                          )}
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
        companies={companies}
        riskTypes={riskTypes}
        onSave={handleCreate}
        onQuickCreateCompany={() => setQuickCompanyDialogOpen(true)}
      />

      {editingDeadline && (
        <DeadlineEditSheet
          open={editingDeadlineSheetOpen}
          onOpenChange={(open) => {
            setEditingDeadlineSheetOpen(open);
            if (!open) {
              setEditingDeadline(undefined);
            }
          }}
          deadline={editingDeadline}
          companies={companies}
          riskTypes={riskTypes}
          onSave={handleUpdate}
          onQuickCreateCompany={() => setQuickCompanyDialogOpen(true)}
        />
      )}

      <QuickCompanyDialog
        open={quickCompanyDialogOpen}
        onOpenChange={setQuickCompanyDialogOpen}
        onSave={handleCreateCompany}
      />

      {completingDeadline && (
        <CompleteValidationDialog
          open={completeDialogOpen}
          onOpenChange={setCompleteDialogOpen}
          deadline={completingDeadline}
          onComplete={handleCompleteValidation}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa scadenza? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeadlineToDelete(null)}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
