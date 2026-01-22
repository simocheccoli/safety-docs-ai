import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, MapPin, Mail, Phone, LayoutGrid, List, Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { companyApi } from '@/lib/companyApi';
import { Company } from '@/types/company';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CompanyEditSheet } from '@/components/CompanyEditSheet';
import { CompanyGridSkeleton } from '@/components/ui/loading-skeletons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type ViewMode = 'card' | 'table';

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyApi.getAll();
      setCompanies(data);
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le aziende',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSheet = (company?: Company) => {
    setSelectedCompany(company || null);
    setSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;

    try {
      await companyApi.delete(companyToDelete.id);
      toast({
        title: 'Successo',
        description: 'Azienda eliminata con successo',
      });
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
      loadCompanies();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'azienda',
        variant: 'destructive',
      });
    }
  };

  // Paginazione
  const totalPages = Math.ceil(companies.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedCompanies = companies.slice(startIndex, startIndex + perPage);

  // Reset pagina quando cambia perPage
  useEffect(() => {
    setCurrentPage(1);
  }, [perPage]);

  // Funzione per esportare in CSV
  const exportToCSV = () => {
    const headers = [
      'Nome',
      'Partita IVA',
      'Codice Fiscale',
      'Indirizzo',
      'Città',
      'CAP',
      'Provincia',
      'Paese',
      'Email',
      'Telefono',
      'PEC',
      'Rappresentante Legale',
      'RSPP',
      'RLS',
      'Medico Competente',
      'Stabilimenti'
    ];

    const rows = paginatedCompanies.map(company => {
      const branchesInfo = company.branches && company.branches.length > 0
        ? company.branches.length === 1
          ? company.branches[0].name
          : `${company.branches.length} stabilimenti`
        : '';

      return [
        company.name || '',
        company.vat || company.vat_number || '',
        company.fiscalCode || company.tax_code || '',
        company.address || '',
        company.city || '',
        company.cap || company.zip || '',
        company.province || '',
        company.country || '',
        company.email || '',
        company.phone || '',
        company.pec || '',
        company.legalRepresentative || company.legal_representative || '',
        company.rspp || '',
        company.rls || '',
        company.medico || company.doctor || '',
        branchesInfo
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `aziende_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Successo',
      description: 'File CSV esportato con successo',
    });
  };

  // Funzione per esportare in Excel (usando CSV con estensione .xlsx come fallback)
  const exportToExcel = async () => {
    try {
      // Prova a usare xlsx se disponibile
      const xlsx = await import('xlsx');
      
      const headers = [
        'Nome',
        'Partita IVA',
        'Codice Fiscale',
        'Indirizzo',
        'Città',
        'CAP',
        'Provincia',
        'Paese',
        'Email',
        'Telefono',
        'PEC',
        'Rappresentante Legale',
        'RSPP',
        'RLS',
        'Medico Competente',
        'Stabilimenti'
      ];

      const rows = paginatedCompanies.map(company => {
        const branchesInfo = company.branches && company.branches.length > 0
          ? company.branches.length === 1
            ? company.branches[0].name
            : `${company.branches.length} stabilimenti`
          : '';

        return [
          company.name || '',
          company.vat || company.vat_number || '',
          company.fiscalCode || company.tax_code || '',
          company.address || '',
          company.city || '',
          company.cap || company.zip || '',
          company.province || '',
          company.country || '',
          company.email || '',
          company.phone || '',
          company.pec || '',
          company.legalRepresentative || company.legal_representative || '',
          company.rspp || '',
          company.rls || '',
          company.medico || company.doctor || '',
          branchesInfo
        ];
      });

      const worksheet = xlsx.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Aziende');
      
      // Formattare header
      const range = xlsx.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = xlsx.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E0E0E0' } }
        };
      }

      xlsx.writeFile(workbook, `aziende_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: 'Successo',
        description: 'File Excel esportato con successo',
      });
    } catch (error) {
      // Fallback a CSV se xlsx non è disponibile
      toast({
        title: 'Avviso',
        description: 'Libreria Excel non disponibile, esportazione in CSV',
      });
      exportToCSV();
    }
  };

  // Funzione per renderizzare gli elementi di paginazione
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


  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Aziende</h1>
            <p className="text-muted-foreground">Gestisci le aziende clienti</p>
          </div>
        </div>
        <CompanyGridSkeleton items={6} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Aziende</h1>
          <p className="text-muted-foreground">Gestisci le aziende clienti</p>
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
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                Esporta CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                Esporta Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => handleOpenSheet()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuova Azienda
          </Button>
        </div>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna azienda trovata</h3>
            <p className="text-muted-foreground mb-4">Inizia aggiungendo la prima azienda</p>
            <Button onClick={() => handleOpenSheet()}>
              <Plus className="mr-2 h-4 w-4" />
              Crea Azienda
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenSheet(company)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCompanyToDelete(company);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {(company.vat || company.vat_number) && (
                  <CardDescription>P.IVA: {company.vat || company.vat_number}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {company.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div>{company.address}</div>
                      {((company.cap || company.zip) || company.city || company.province) && (
                        <div className="text-muted-foreground">
                          {company.cap || company.zip} {company.city} {company.province}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.branches && company.branches.length > 0 && (
                  <div className="pt-2 border-t">
                    {company.branches.length === 1 ? (
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{company.branches[0].name}</span>
                            {company.branches[0].is_main && (
                              <Badge variant="secondary" className="text-xs">Principale</Badge>
                            )}
                          </div>
                          {company.branches[0].address && (
                            <div className="text-muted-foreground text-xs mt-1">
                              {company.branches[0].address}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {company.branches.length} stabilimenti
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {(company.legalRepresentative || company.legal_representative) && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">Legale Rapp.:</span>{' '}
                    {company.legalRepresentative || company.legal_representative}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-medium">Nome Azienda</TableHead>
                <TableHead className="font-medium">Partita IVA</TableHead>
                <TableHead className="font-medium">Codice Fiscale</TableHead>
                <TableHead className="font-medium">Indirizzo</TableHead>
                <TableHead className="font-medium">Email</TableHead>
                <TableHead className="font-medium">Telefono</TableHead>
                <TableHead className="font-medium">Stabilimenti</TableHead>
                <TableHead className="text-right font-medium">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    Nessuna azienda trovata
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCompanies.map((company) => {
                  const addressFull = [
                    company.address,
                    company.cap || company.zip,
                    company.city,
                    company.province
                  ].filter(Boolean).join(', ');

                  const branchesInfo = company.branches && company.branches.length > 0
                    ? company.branches.length === 1
                      ? company.branches[0].name + (company.branches[0].is_main ? ' (Principale)' : '')
                      : `${company.branches.length} stabilimenti`
                    : '';

                  return (
                    <TableRow key={company.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.vat || company.vat_number || '-'}</TableCell>
                      <TableCell>{company.fiscalCode || company.tax_code || '-'}</TableCell>
                      <TableCell>{addressFull || '-'}</TableCell>
                      <TableCell>{company.email || '-'}</TableCell>
                      <TableCell>{company.phone || '-'}</TableCell>
                      <TableCell>{branchesInfo || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenSheet(company)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCompanyToDelete(company);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Paginazione */}
      {companies.length > 0 && totalPages > 1 && (
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
      {companies.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <div>
            Mostrando {startIndex + 1} - {Math.min(startIndex + perPage, companies.length)} di {companies.length} aziende
          </div>
        </div>
      )}

      <CompanyEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        company={selectedCompany || undefined}
        onSuccess={() => {
          setSheetOpen(false);
          loadCompanies();
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare l'azienda "{companyToDelete?.name}"?
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
