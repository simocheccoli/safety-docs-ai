import { useState, useEffect } from "react";
import { Plus, Download, Eye, Trash2, Archive, X, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewElaborationDialog } from "@/components/NewElaborationDialog";
import { ElaborationDetailsDialog } from "@/components/ElaborationDetailsDialog";
import { Elaboration } from "@/types/elaboration";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchElaborations, deleteElaboration, downloadExcel, downloadZip, createElaboration } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";

type SortField = 'title' | 'status' | 'begin_process';
type SortDirection = 'asc' | 'desc' | null;

export default function SafetySheets() {
  const [allElaborations, setAllElaborations] = useState<Elaboration[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const perPage = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedElaboration, setSelectedElaboration] = useState<Elaboration | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [elaborationToDelete, setElaborationToDelete] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    loadElaborations();
  }, []);

  const loadElaborations = async () => {
    setLoading(true);
    try {
      const result = await fetchElaborations();
      setAllElaborations(result);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare le elaborazioni",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewElaboration = async (name: string, files: File[]) => {
    try {
      await createElaboration(name, files);
      
      toast({
        title: "Elaborazione creata",
        description: "L'elaborazione è stata avviata con successo",
      });

      await loadElaborations();
      setDialogOpen(false);
      setCurrentPage(1);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare l'elaborazione",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (elaboration: Elaboration) => {
    setSelectedElaboration(elaboration);
    setDetailsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setElaborationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (elaborationToDelete === null) return;
    
    try {
      await deleteElaboration(elaborationToDelete);
      toast({
        title: "Successo",
        description: "Elaborazione eliminata con successo",
      });
      loadElaborations();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'elaborazione",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setElaborationToDelete(null);
    }
  };

  const handleDownloadExcel = (id: number) => {
    downloadExcel(id);
    toast({
      title: "Download avviato",
      description: "Il file Excel verrà scaricato a breve",
    });
  };

  const handleDownloadZip = (id: number) => {
    downloadZip(id);
    toast({
      title: "Download avviato",
      description: "Il file ZIP verrà scaricato a breve",
    });
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      elaborating: { 
        label: "In elaborazione", 
        dotColor: "bg-warning",
        textColor: "text-muted-foreground"
      },
      completed: { 
        label: "Completato", 
        dotColor: "bg-success",
        textColor: "text-muted-foreground"
      },
      error: { 
        label: "Errore", 
        dotColor: "bg-destructive",
        textColor: "text-muted-foreground"
      },
    };
    const config = configs[status as keyof typeof configs];
    return (
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
        <span className={`text-sm ${config.textColor}`}>{config.label}</span>
      </div>
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground/50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-1 text-primary" />;
    }
    return <ArrowDown className="h-4 w-4 ml-1 text-primary" />;
  };

  // Applicazione filtri, ordinamento e paginazione lato frontend
  let processedElaborations = [...allElaborations];

  // Filtri
  processedElaborations = processedElaborations.filter((elab) => {
    const matchesSearch = elab.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || elab.status === statusFilter;
    
    let matchesDateFrom = true;
    let matchesDateTo = true;
    
    if (dateFrom) {
      const elaborationDate = new Date(elab.begin_process);
      elaborationDate.setHours(0, 0, 0, 0);
      const filterDate = new Date(dateFrom);
      filterDate.setHours(0, 0, 0, 0);
      matchesDateFrom = elaborationDate >= filterDate;
    }
    
    if (dateTo) {
      const elaborationDate = new Date(elab.begin_process);
      elaborationDate.setHours(0, 0, 0, 0);
      const filterDate = new Date(dateTo);
      filterDate.setHours(0, 0, 0, 0);
      matchesDateTo = elaborationDate <= filterDate;
    }
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Ordinamento
  if (sortField && sortDirection) {
    processedElaborations.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'begin_process') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === 'title' || sortField === 'status') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalFiltered = processedElaborations.length;
  const totalPages = Math.ceil(totalFiltered / perPage);

  // Paginazione
  const startIndex = (currentPage - 1) * perPage;
  const paginatedElaborations = processedElaborations.slice(startIndex, startIndex + perPage);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setSortField(null);
    setSortDirection(null);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || dateFrom || dateTo || sortField !== null;

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

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Schede di Sicurezza
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestione elaborazioni e reportistica
          </p>
        </div>
        <Button 
          onClick={() => setDialogOpen(true)} 
          variant="outline"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuova Elaborazione
        </Button>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Cerca per titolo
            </label>
            <Input
              placeholder="Filtra per titolo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Stato
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tutti gli stati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="elaborating">In elaborazione</SelectItem>
                <SelectItem value="completed">Completato</SelectItem>
                <SelectItem value="error">Errore</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                className="w-full gap-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Cancella filtri
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Data inizio da
            </label>
            <DatePicker 
              date={dateFrom} 
              onSelect={setDateFrom}
              placeholder="Seleziona data inizio"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Data inizio a
            </label>
            <DatePicker 
              date={dateTo} 
              onSelect={setDateTo}
              placeholder="Seleziona data fine"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-medium text-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('title')}
                  className="h-auto p-0 hover:bg-transparent font-medium"
                >
                  Titolo
                  {getSortIcon('title')}
                </Button>
              </TableHead>
              <TableHead className="font-medium text-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('status')}
                  className="h-auto p-0 hover:bg-transparent font-medium"
                >
                  Stato
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead className="font-medium text-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('begin_process')}
                  className="h-auto p-0 hover:bg-transparent font-medium"
                >
                  Data Inizio
                  {getSortIcon('begin_process')}
                </Button>
              </TableHead>
              <TableHead className="text-right font-medium text-foreground">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Caricamento...
                </TableCell>
              </TableRow>
            ) : paginatedElaborations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Nessuna elaborazione trovata
                </TableCell>
              </TableRow>
            ) : (
              paginatedElaborations.map((elaboration) => (
                <TableRow key={elaboration.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{elaboration.title}</TableCell>
                  <TableCell>{getStatusBadge(elaboration.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(elaboration.begin_process)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(elaboration)}
                            className="hover:bg-muted"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visualizza schede PDF</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {elaboration.status === "completed" && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadExcel(elaboration.id)}
                                className="hover:bg-muted"
                              >
                                <Download className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Scarica report Excel</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadZip(elaboration.id)}
                                className="hover:bg-muted"
                              >
                                <Archive className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Scarica archivio ZIP delle schede</p>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )}
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(elaboration.id)}
                            className="hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 text-destructive/70" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Elimina elaborazione</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

      <NewElaborationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleNewElaboration}
      />

      <ElaborationDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        elaboration={selectedElaboration}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa elaborazione? Questa azione non può essere annullata e tutti i dati associati verranno rimossi definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
}
