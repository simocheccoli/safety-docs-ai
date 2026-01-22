import { useState, useEffect } from "react";
import { Plus, Download, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiskTable } from "@/components/RiskTable";
import { RiskType, RiskStatus } from "@/types/risk";
import { getRiskTypes } from "@/lib/riskApi";
import { useToast } from "@/hooks/use-toast";
import { useListPagination } from "@/hooks/useListPagination";
import { exportToCSV, exportToExcel } from "@/utils/exportUtils";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const RiskManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [risks, setRisks] = useState<RiskType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RiskStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRisks();
    
    const handleUpdate = () => loadRisks();
    window.addEventListener('riskTypesUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('riskTypesUpdated', handleUpdate);
    };
  }, []);

  const loadRisks = async () => {
    try {
      setIsLoading(true);
      const data = await getRiskTypes();
      setRisks(data);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i rischi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/rischi/new");
  };

  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || risk.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Usa hook per paginazione e selezione
  const {
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    totalPages,
    paginatedItems: paginatedRisks,
    startIndex,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    hasSelection,
    getSelectedItems,
  } = useListPagination(filteredRisks, 10);

  // Funzioni export
  const handleExportCSV = () => {
    exportToCSV(
      paginatedRisks,
      ['Nome', 'Descrizione', 'Stato', 'Versione', 'Ultima Modifica'],
      (risk) => [
        risk.name || '',
        risk.description || '',
        risk.status || '',
        risk.version?.toString() || '',
        format(new Date(risk.updatedAt), 'dd/MM/yyyy HH:mm', { locale: it }),
      ],
      'rischi'
    );
    toast({
      title: 'Successo',
      description: 'File CSV esportato con successo',
    });
  };

  const handleExportExcel = async () => {
    await exportToExcel(
      paginatedRisks,
      ['Nome', 'Descrizione', 'Stato', 'Versione', 'Ultima Modifica'],
      (risk) => [
        risk.name || '',
        risk.description || '',
        risk.status || '',
        risk.version?.toString() || '',
        format(new Date(risk.updatedAt), 'dd/MM/yyyy HH:mm', { locale: it }),
      ],
      'rischi'
    );
    toast({
      title: 'Successo',
      description: 'File Excel esportato con successo',
    });
  };

  const handleExportSelected = async () => {
    const selected = getSelectedItems();
    if (selected.length === 0) return;

    await exportToExcel(
      selected,
      ['Nome', 'Descrizione', 'Stato', 'Versione', 'Ultima Modifica'],
      (risk) => [
        risk.name || '',
        risk.description || '',
        risk.status || '',
        risk.version?.toString() || '',
        format(new Date(risk.updatedAt), 'dd/MM/yyyy HH:mm', { locale: it }),
      ],
      `rischi_selezionati_${selected.length}`
    );
    toast({
      title: 'Successo',
      description: `${selected.length} elementi esportati con successo`,
    });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Rischi AI</h1>
          <p className="text-muted-foreground mt-2">
            Configura i rischi con AI per l'estrazione automatica dei dati
          </p>
        </div>
        <div className="flex items-center gap-2">
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

          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Rischio
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Cerca per nome o descrizione..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RiskStatus | "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="draft">Bozza</SelectItem>
            <SelectItem value="validated">Validato</SelectItem>
            <SelectItem value="active">Attivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <RiskTable 
        risks={paginatedRisks} 
        onRefresh={loadRisks}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onToggleSelectAll={toggleSelectAll}
        isAllSelected={isAllSelected}
      />

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
      {filteredRisks.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <div>
            Mostrando {startIndex + 1} - {Math.min(startIndex + perPage, filteredRisks.length)} di {filteredRisks.length} rischi
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
    </div>
  );
};


export default RiskManagement;
