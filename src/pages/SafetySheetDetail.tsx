import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, FileSpreadsheet, Download, Archive, Building2, Calendar, FileText, FolderUp, Briefcase, Building, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Elaboration, ElaborationUpload } from "@/types/elaboration";
import { 
  fetchElaborationById, 
  fetchElaborationUploads, 
  deleteUpload, 
  generateExcel,
  downloadExcel,
  downloadZip
} from "@/lib/elaborationApi";
import { useToast } from "@/hooks/use-toast";
import { NewUploadDialog } from "@/components/safety-sheets/NewUploadDialog";

export default function SafetySheetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [elaboration, setElaboration] = useState<Elaboration | null>(null);
  const [uploads, setUploads] = useState<ElaborationUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadToDelete, setUploadToDelete] = useState<number | null>(null);
  const [generatingExcel, setGeneratingExcel] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [elabResult, uploadsResult] = await Promise.all([
        fetchElaborationById(Number(id)),
        fetchElaborationUploads(Number(id))
      ]);
      
      if (!elabResult) {
        toast({
          title: "Errore",
          description: "Scheda di sicurezza non trovata",
          variant: "destructive",
        });
        navigate('/safety-sheets');
        return;
      }
      
      setElaboration(elabResult);
      setUploads(uploadsResult);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewUpload = () => {
    loadData();
    setUploadDialogOpen(false);
  };

  const handleDeleteClick = (uploadId: number) => {
    setUploadToDelete(uploadId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (uploadToDelete === null) return;
    
    try {
      await deleteUpload(uploadToDelete);
      toast({
        title: "Successo",
        description: "Caricamento eliminato con successo",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il caricamento",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setUploadToDelete(null);
    }
  };

  const handleGenerateExcel = async () => {
    if (!elaboration) return;
    
    setGeneratingExcel(true);
    try {
      await generateExcel(elaboration.id);
      toast({
        title: "Elaborazione avviata",
        description: "La generazione del documento Excel è stata avviata. Lo stato verrà aggiornato al completamento.",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile avviare la generazione del documento",
        variant: "destructive",
      });
    } finally {
      setGeneratingExcel(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!elaboration) return;
    downloadExcel(elaboration.id);
    toast({
      title: "Download avviato",
      description: "Il file Excel verrà scaricato a breve",
    });
  };

  const handleDownloadZip = () => {
    if (!elaboration) return;
    downloadZip(elaboration.id);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      bozza: { label: "Bozza", variant: "secondary" },
      pending: { label: "In attesa", variant: "outline" },
      elaborating: { label: "In elaborazione", variant: "default" },
      completed: { label: "Completato", variant: "default" },
      error: { label: "Errore", variant: "destructive" },
    };
    const config = configs[status] || configs.bozza;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  if (!elaboration) {
    return null;
  }

  const canGenerateExcel = uploads.length > 0 && elaboration.status === 'bozza';
  const canDownload = elaboration.status === 'completed';

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/safety-sheets')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                  {elaboration.title}
                </h1>
                {getStatusBadge(elaboration.status)}
              </div>
              {elaboration.description && (
                <p className="text-sm text-muted-foreground mt-1">{elaboration.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {elaboration.company_name && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{elaboration.company_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Creato il {formatDate(elaboration.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canGenerateExcel && (
              <Button 
                onClick={handleGenerateExcel} 
                disabled={generatingExcel}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                {generatingExcel ? "Generazione..." : "Genera Excel"}
              </Button>
            )}
            {canDownload && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleDownloadExcel}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Scarica Excel</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleDownloadZip}>
                      <Archive className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Scarica ZIP</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FolderUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{uploads.length}</div>
                  <div className="text-sm text-muted-foreground">Caricamenti</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {uploads.reduce((acc, u) => acc + u.files.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Allegati totali</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {new Set(uploads.map(u => u.reparto)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Reparti</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Uploads Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Caricamenti</CardTitle>
              <CardDescription>
                Elenco dei caricamenti suddivisi per mansione, reparto e ruolo
              </CardDescription>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuovo Caricamento
            </Button>
          </CardHeader>
          <CardContent>
            {uploads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nessun caricamento presente</p>
                <p className="text-sm mt-1">Aggiungi un nuovo caricamento per iniziare</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        Mansione
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5" />
                        Reparto
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Ruolo
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-foreground">Allegati</TableHead>
                    <TableHead className="font-medium text-foreground">Stato</TableHead>
                    <TableHead className="font-medium text-foreground">Data</TableHead>
                    <TableHead className="text-right font-medium text-foreground">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploads.map((upload) => (
                    <TableRow key={upload.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{upload.mansione}</TableCell>
                      <TableCell>{upload.reparto}</TableCell>
                      <TableCell>{upload.ruolo}</TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 cursor-help">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{upload.files.length} file</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <div className="space-y-1">
                              {upload.files.map((file) => (
                                <div key={file.id} className="text-xs flex justify-between gap-4">
                                  <span className="truncate">{file.filename}</span>
                                  <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{getStatusBadge(upload.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(upload.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(upload.id)}
                                className="hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 text-destructive/70" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Elimina caricamento</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <NewUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          elaborationId={elaboration.id}
          onSuccess={handleNewUpload}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare questo caricamento? Tutti gli allegati associati verranno rimossi.
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
