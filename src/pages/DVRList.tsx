import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Calendar, User, Edit, Trash2, Building2, LayoutGrid, List, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useListPagination } from "@/hooks/useListPagination";
import { exportToCSV, exportToExcel } from "@/utils/exportUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { dvrApi } from "@/lib/dvrApi";
import { DVR } from "@/types/dvr";
import { toast } from "@/hooks/use-toast";
import { statusLabels, statusColors } from "@/components/dvr/DVRInfoEditor";

export default function DVRList() {
  const navigate = useNavigate();
  const [dvrs, setDvrs] = useState<DVR[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  useEffect(() => {
    loadDVRs();
  }, []);

  const loadDVRs = async () => {
    try {
      setLoading(true);
      const allDvrs = await dvrApi.getDVRList();
      setDvrs(allDvrs);
    } catch (error) {
      console.error("Errore nel caricamento dei DVR:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare la lista DVR",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dvrId: string) => {
    try {
      await dvrApi.deleteDVR(dvrId);
      loadDVRs();
      toast({
        title: "DVR Eliminato",
        description: "Il documento è stato rimosso con successo",
      });
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il DVR",
        variant: "destructive",
      });
    }
  };

  const getFileCount = (dvr: DVR) => {
    return (dvr as any).files_count || 0;
  };

  const getIncludedFileCount = (dvr: DVR) => {
    return (dvr as any).included_files_count || 0;
  };

  // Usa hook per paginazione e selezione
  const {
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    totalPages,
    paginatedItems: paginatedDVRs,
    startIndex,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    hasSelection,
    getSelectedItems,
  } = useListPagination(dvrs, 10);

  // Funzioni export
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const handleExportCSV = () => {
    exportToCSV(
      paginatedDVRs,
      ['Nome', 'Descrizione', 'Azienda', 'Stato', 'Numero Revisione', 'Data Creazione', 'Data Ultima Modifica'],
      (dvr) => [
        dvr.nome || '',
        dvr.descrizione || '',
        dvr.company?.name || '',
        statusLabels[dvr.stato] || '',
        dvr.numero_revisione?.toString() || '',
        formatDate(dvr.data_creazione),
        formatDate(dvr.data_ultima_modifica),
      ],
      'dvr'
    );
    toast({
      title: 'Successo',
      description: 'File CSV esportato con successo',
    });
  };

  const handleExportExcel = async () => {
    await exportToExcel(
      paginatedDVRs,
      ['Nome', 'Descrizione', 'Azienda', 'Stato', 'Numero Revisione', 'Data Creazione', 'Data Ultima Modifica'],
      (dvr) => [
        dvr.nome || '',
        dvr.descrizione || '',
        dvr.company?.name || '',
        statusLabels[dvr.stato] || '',
        dvr.numero_revisione?.toString() || '',
        formatDate(dvr.data_creazione),
        formatDate(dvr.data_ultima_modifica),
      ],
      'dvr'
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
      ['Nome', 'Descrizione', 'Azienda', 'Stato', 'Numero Revisione', 'Data Creazione', 'Data Ultima Modifica'],
      (dvr) => [
        dvr.nome || '',
        dvr.descrizione || '',
        dvr.company?.name || '',
        statusLabels[dvr.stato] || '',
        dvr.numero_revisione?.toString() || '',
        formatDate(dvr.data_creazione),
        formatDate(dvr.data_ultima_modifica),
      ],
      `dvr_selezionati_${selected.length}`
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documenti di Valutazione dei Rischi</h1>
          <p className="text-muted-foreground">Gestisci e revisiona i tuoi DVR</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle Vista */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
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

          <Button onClick={() => navigate('/dvr/wizard')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo DVR
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Caricamento...</p>
          </CardContent>
        </Card>
      ) : dvrs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessun DVR Presente</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Inizia creando il tuo primo Documento di Valutazione dei Rischi utilizzando il wizard guidato
            </p>
            <Button onClick={() => navigate('/dvr/wizard')}>
              <Plus className="h-4 w-4 mr-2" />
              Crea Primo DVR
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid gap-4">
          {paginatedDVRs.map((dvr) => (
            <Card key={dvr.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{dvr.nome}</CardTitle>
                      <Badge className={statusColors[dvr.stato]}>
                        {statusLabels[dvr.stato]}
                      </Badge>
                      <Badge variant="outline">Rev. {dvr.numero_revisione}</Badge>
                    </div>
                    <CardDescription>
                      {dvr.descrizione || `${getIncludedFileCount(dvr)} file inclusi su ${getFileCount(dvr)} totali`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dvr/${dvr.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Apri
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare questo DVR? Questa azione non può essere annullata.
                            Verranno eliminati anche tutti i file e le revisioni associate.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(String(dvr.id))}>
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  {dvr.company ? (
                    <div className="p-4 rounded-lg border-2 bg-card" style={{ borderColor: 'hsl(var(--primary))', backgroundColor: 'hsl(var(--primary) / 0.05)' }}>
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 mt-0.5" style={{ color: 'hsl(var(--primary))' }} />
                        <div className="flex-1 space-y-2">
                          <div>
                            <span className="font-semibold text-base" style={{ color: 'hsl(var(--primary))' }}>
                              {dvr.company.name}
                            </span>
                          </div>
                          {/* Additional company details can be added here when available */}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border-2 bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground italic">Nessuna azienda associata</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Creato: {new Date(dvr.data_creazione).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Modificato: {new Date(dvr.data_ultima_modifica).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Creato da: {dvr.created_by}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Modificato da: {dvr.updated_by}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <TableHead className="font-medium">Nome</TableHead>
                  <TableHead className="font-medium">Azienda</TableHead>
                  <TableHead className="font-medium">Stato</TableHead>
                  <TableHead className="font-medium">Revisione</TableHead>
                  <TableHead className="font-medium">Data Creazione</TableHead>
                  <TableHead className="text-right font-medium">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDVRs.map((dvr) => (
                  <TableRow key={dvr.id} className="hover:bg-muted/20">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(dvr.id)}
                        onCheckedChange={() => toggleSelection(dvr.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{dvr.nome}</TableCell>
                    <TableCell>{dvr.company?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[dvr.stato]}>
                        {statusLabels[dvr.stato]}
                      </Badge>
                    </TableCell>
                    <TableCell>Rev. {dvr.numero_revisione}</TableCell>
                    <TableCell>{formatDate(dvr.data_creazione)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/dvr/${dvr.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sei sicuro di voler eliminare questo DVR? Questa azione non può essere annullata.
                                Verranno eliminati anche tutti i file e le revisioni associate.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(String(dvr.id))}>
                                Elimina
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
          {dvrs.length > 0 && (
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
              <div>
                Mostrando {startIndex + 1} - {Math.min(startIndex + perPage, dvrs.length)} di {dvrs.length} DVR
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
    </div>
  );
}
