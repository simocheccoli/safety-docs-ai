import { useState, useEffect } from "react";
import { Plus, Download, Eye, Trash2, Archive, Filter } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
import { fetchElaborations, deleteElaboration, downloadExcel, downloadZip } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SafetySheets() {
  const [elaborations, setElaborations] = useState<Elaboration[]>([]);
  const [totalElaborations, setTotalElaborations] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const perPage = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedElaboration, setSelectedElaboration] = useState<Elaboration | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadElaborations();
  }, [currentPage]);

  const loadElaborations = async () => {
    setLoading(true);
    try {
      const result = await fetchElaborations(currentPage, perPage);
      setElaborations(result.data);
      setTotalElaborations(result.total);
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

  const handleNewElaboration = (name: string, files: File[]) => {
    const newElaboration: Elaboration = {
      id: Math.max(...elaborations.map(e => e.id), 0) + 1,
      title: name,
      status: "elaborating",
      begin_process: new Date().toISOString(),
      end_process: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    setElaborations([newElaboration, ...elaborations]);
    setDialogOpen(false);
  };

  const handleViewDetails = (elaboration: Elaboration) => {
    setSelectedElaboration(elaboration);
    setDetailsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteElaboration(id);
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
      elaborating: { label: "In elaborazione", className: "bg-warning text-warning-foreground" },
      completed: { label: "Completato", className: "bg-success text-success-foreground" },
      error: { label: "Errore", className: "bg-destructive text-destructive-foreground" },
    };
    const config = configs[status as keyof typeof configs];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredElaborations = elaborations.filter((elab) => {
    const matchesSearch = elab.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || elab.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(totalElaborations / perPage);

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
          size="lg"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuova Elaborazione
        </Button>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Input
            placeholder="Cerca per titolo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="elaborating">In elaborazione</SelectItem>
            <SelectItem value="completed">Completato</SelectItem>
            <SelectItem value="error">Errore</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Titolo</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Inizio Elaborazione</TableHead>
              <TableHead className="text-right font-semibold">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredElaborations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Nessuna elaborazione trovata
                </TableCell>
              </TableRow>
            ) : (
              filteredElaborations.map((elaboration) => (
                <TableRow key={elaboration.id}>
                  <TableCell className="font-medium">{elaboration.title}</TableCell>
                  <TableCell>{getStatusBadge(elaboration.status)}</TableCell>
                  <TableCell>{formatDate(elaboration.begin_process)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(elaboration)}
                        title="Visualizza schede PDF"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                       {elaboration.status === "completed" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadExcel(elaboration.id)}
                            title="Scarica Excel"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadZip(elaboration.id)}
                            title="Scarica ZIP schede"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(elaboration.id)}
                        title="Elimina"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
    </div>
  );
}
