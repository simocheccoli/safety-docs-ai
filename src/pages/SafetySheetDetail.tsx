import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, FileSpreadsheet, Download, Archive, Building2, Calendar, FileText, FolderUp, Briefcase, Building, User, ChevronDown, ChevronRight, Eye, X, Loader2, Square, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailPageSkeleton, UploadListSkeleton, StatCardGridSkeleton } from "@/components/ui/loading-skeletons";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Elaboration, ElaborationUpload, ElaborationFile, ElaborationUpdate } from "@/types/elaboration";
import { 
  fetchElaborationById, 
  fetchElaborationUploads, 
  fetchElaborationLogs,
  deleteUpload,
  deleteFile,
  generateElaboration,
  cancelElaboration,
  downloadExcel,
  downloadZip,
} from "@/lib/elaborationApi";
import { useElaborationSSE } from "@/hooks/useElaborationSSE";
import { useToast } from "@/hooks/use-toast";
import { NewUploadDialog } from "@/components/safety-sheets/NewUploadDialog";
import { useFilePreview } from "@/contexts/FilePreviewContext";

interface FileWithContext extends ElaborationFile {
  mansione: string;
  reparto: string;
  area: string;
}

export default function SafetySheetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [elaboration, setElaboration] = useState<Elaboration | null>(null);
  const [uploads, setUploads] = useState<ElaborationUpload[]>([]);
  const [logs, setLogs] = useState<ElaborationUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadToDelete, setUploadToDelete] = useState<number | null>(null);
  const [deleteFileDialogOpen, setDeleteFileDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{uploadId: number, fileId: number} | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generatingElaboration, setGeneratingElaboration] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [expandedUploads, setExpandedUploads] = useState<Set<number>>(new Set());
  const [logsExpanded, setLogsExpanded] = useState(false);
  const { openPreview } = useFilePreview();

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  // SSE per aggiornamenti in tempo reale
  const { data: sseData } = useElaborationSSE(
    elaboration?.id ?? null,
    {
      enabled: elaboration?.status === 'processing' || elaboration?.status === 'elaborating' || elaboration?.status === 'error' || elaboration?.status === 'interrupted',
      onUpdate: (update) => {
        // Aggiorna lo stato locale con i dati SSE
        if (elaboration) {
          const previousErrorCount = elaboration.errorCount || 0;
          const newErrorCount = update.errorCount || 0;
          
          // Mostra toast quando vengono rilevati nuovi errori
          if (newErrorCount > previousErrorCount && update.errors && update.errors.length > 0) {
            const newErrors = update.errors.slice(previousErrorCount);
            newErrors.forEach((error) => {
              toast({
                title: "Errore durante l'elaborazione",
                description: `${error.filename || 'File'}: ${error.error}`,
                variant: "destructive",
                duration: 5000,
              });
            });
          }
          
          // Mostra toast quando l'elaborazione termina con errori
          if ((update.status === 'error' || update.status === 'interrupted') && newErrorCount > 0 && previousErrorCount === 0) {
            toast({
              title: update.status === 'interrupted' ? "Elaborazione interrotta" : "Elaborazione completata con errori",
              description: `${newErrorCount} errore${newErrorCount > 1 ? 'i' : ''} rilevato${newErrorCount > 1 ? 'i' : ''} durante l'elaborazione`,
              variant: "destructive",
              duration: 7000,
            });
          }
          
          setElaboration({
            ...elaboration,
            status: update.status as any,
            current: update.current,
            total: update.total,
            progress: update.progress,
            errors: update.errors,
            errorCount: update.errorCount,
            stage: update.stage,
            message: update.message,
          });
        }
      },
    }
  );

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
      
      // Debug: log per vedere i dati che arrivano
      console.log('Elaboration data:', {
        status: elabResult.status,
        current: elabResult.current,
        total: elabResult.total,
        progress: elabResult.progress,
        errors: elabResult.errors,
        errorCount: elabResult.errorCount
      });
      
      // Mostra toast se ci sono errori quando viene caricata l'elaborazione
      if (elabResult.errorCount && elabResult.errorCount > 0 && (elabResult.status === 'error' || elabResult.status === 'interrupted')) {
        toast({
          title: elabResult.status === 'interrupted' ? "Elaborazione interrotta" : "Elaborazione completata con errori",
          description: `${elabResult.errorCount} errore${elabResult.errorCount > 1 ? 'i' : ''} rilevato${elabResult.errorCount > 1 ? 'i' : ''} durante l'elaborazione`,
          variant: "destructive",
          duration: 7000,
        });
      }
      
      setElaboration(elabResult);
      setUploads(uploadsResult);
      
      // Carica i log se ci sono errori o se l'elaborazione è in corso/completata
      if (elabResult.status === 'error' || elabResult.status === 'interrupted' || elabResult.status === 'processing' || elabResult.status === 'elaborating' || elabResult.status === 'completed') {
        loadLogs();
      }
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
    if (uploadToDelete === null || !id) return;
    
    try {
      await deleteUpload(Number(id), uploadToDelete);
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

  const handleDeleteFileClick = (uploadId: number, fileId: number) => {
    setFileToDelete({ uploadId, fileId });
    setDeleteFileDialogOpen(true);
  };

  const handleDeleteFileConfirm = async () => {
    if (fileToDelete === null || !id) return;
    
    try {
      await deleteFile(Number(id), fileToDelete.uploadId, fileToDelete.fileId);
      toast({
        title: "Successo",
        description: "File eliminato con successo",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il file",
        variant: "destructive",
      });
    } finally {
      setDeleteFileDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const handleGenerateElaboration = () => {
    // Apri il dialog di conferma
    setGenerateDialogOpen(true);
  };

  const confirmGenerateElaboration = async () => {
    if (!elaboration) return;
    
    setGenerateDialogOpen(false);
    setGeneratingElaboration(true);
    try {
      await generateElaboration(elaboration.id);
      toast({
        title: "Elaborazione avviata",
        description: "La generazione è stata avviata. Lo stato verrà aggiornato al completamento.",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile avviare la generazione",
        variant: "destructive",
      });
    } finally {
      setGeneratingElaboration(false);
    }
  };

  const [cancellingElaboration, setCancellingElaboration] = useState(false);

  const handleCancelElaboration = async () => {
    if (!elaboration) return;
    
    setCancellingElaboration(true);
    try {
      await cancelElaboration(elaboration.id);
      toast({
        title: "Elaborazione interrotta",
        description: "L'elaborazione è stata interrotta con successo.",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile interrompere l'elaborazione",
        variant: "destructive",
      });
    } finally {
      setCancellingElaboration(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!elaboration) return;
    
    setDownloadingExcel(true);
    try {
      await downloadExcel(elaboration.id);
      toast({
        title: "Download completato",
        description: "Il file Excel è stato scaricato",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile scaricare il file Excel",
        variant: "destructive",
      });
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!elaboration) return;
    
    setDownloadingZip(true);
    try {
      await downloadZip(elaboration.id);
      toast({
        title: "Download completato",
        description: "Il file ZIP è stato scaricato",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile scaricare il file ZIP",
        variant: "destructive",
      });
    } finally {
      setDownloadingZip(false);
    }
  };

  const loadLogs = async () => {
    if (!id) return;
    setLoadingLogs(true);
    try {
      const logsData = await fetchElaborationLogs(Number(id));
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const toggleUploadExpansion = (uploadId: number) => {
    setExpandedUploads(prev => {
      const next = new Set(prev);
      if (next.has(uploadId)) {
        next.delete(uploadId);
      } else {
        next.add(uploadId);
      }
      return next;
    });
  };

  const handlePreviewFile = (file: FileWithContext) => {
    openPreview({
      previewUrl: file.previewUrl || '',
      filename: file.originalName || file.filename,
      size: file.size,
      metadata: {
        Mansione: file.mansione,
        Reparto: file.reparto,
        Area: file.area,
      },
    });
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string, size: 'sm' | 'lg' = 'sm') => {
    const configs: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      pending: { label: "In attesa", variant: "outline" },
      processing: { label: "In elaborazione", variant: "default", className: "bg-amber-500 hover:bg-amber-500" },
      elaborating: { label: "In elaborazione", variant: "default", className: "bg-amber-500 hover:bg-amber-500" },
      completed: { label: "Completato", variant: "default", className: "bg-green-600 hover:bg-green-600" },
      error: { label: "Errore", variant: "destructive" },
      interrupted: { label: "Interrotta", variant: "outline", className: "bg-orange-500 hover:bg-orange-500 text-white border-orange-600" },
    };
    const config = configs[status] || configs.pending;
    const isProcessing = status === 'processing' || status === 'elaborating';
    return (
      <Badge 
        variant={config.variant} 
        className={`${config.className || ''} ${size === 'lg' ? 'px-3 py-1 text-sm' : ''}`}
      >
        {isProcessing && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (!elaboration) {
    return null;
  }

  // Permetti la generazione se ci sono upload e lo stato non è in elaborazione
  // Permetti anche la rigenerazione se l'elaborazione è completata o in errore
  const canGenerate = uploads.length > 0 && (
    elaboration.status === 'pending' || 
    elaboration.status === 'completed' || 
    elaboration.status === 'error' || 
    elaboration.status === 'interrupted'
  );
  const canDownloadExcel = elaboration.status === 'completed';
  const canDownloadZip = elaboration.status === 'completed';
  const isProcessing = elaboration.status === 'elaborating' || elaboration.status === 'processing';

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
                {getStatusBadge(elaboration.status, 'lg')}
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
            {isProcessing ? (
              <Button
                onClick={handleCancelElaboration}
                disabled={cancellingElaboration}
                variant="destructive"
                className="gap-2"
              >
                {cancellingElaboration ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Interrompi Elaborazione
              </Button>
            ) : (
              <Button
                onClick={handleGenerateElaboration}
                disabled={!canGenerate || generatingElaboration}
                className="gap-2"
              >
                {generatingElaboration ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                Genera Excel
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleDownloadExcel}
                  disabled={!canDownloadExcel || downloadingExcel}
                >
                  {downloadingExcel ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Scarica Excel</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleDownloadZip}
                  disabled={!canDownloadZip || downloadingZip}
                >
                  {downloadingZip ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Scarica ZIP</TooltipContent>
            </Tooltip>
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

        {/* Progress and Errors Section */}
        {(isProcessing || (elaboration.errorCount && elaboration.errorCount > 0) || (elaboration.total && elaboration.total > 0) || elaboration.status === 'error' || elaboration.status === 'interrupted') && (
          <Card>
            <CardHeader>
              <CardTitle>Stato Elaborazione</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isProcessing && (
                <div className="space-y-2">
                  {elaboration.total && elaboration.total > 0 ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          File elaborati: {elaboration.current || 0} di {elaboration.total}
                        </span>
                        <span className="font-medium">
                          {elaboration.progress?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <Progress value={elaboration.progress || 0} className="h-3" />
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Elaborazione in corso... (in attesa di dati di progresso)</span>
                    </div>
                  )}
                </div>
              )}
              
              {!isProcessing && elaboration.total && elaboration.total > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      File elaborati: {elaboration.current || 0} di {elaboration.total}
                    </span>
                    <span className="font-medium">
                      {elaboration.progress?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <Progress value={elaboration.progress || 0} className="h-3" />
                </div>
              )}
              
              {/* Mostra sempre gli errori se presenti, anche se non c'è progresso */}
              {elaboration.errors && elaboration.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>
                    {elaboration.errorCount || elaboration.errors.length} errore{elaboration.errorCount !== 1 ? 'i' : ''} durante l'elaborazione
                  </AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-3">
                      {elaboration.errors.map((error, index) => (
                        <div key={index} className="text-sm border-l-2 border-destructive/50 pl-3 py-1">
                          <div className="font-medium text-destructive mb-1">
                            {error.filename || 'File sconosciuto'}
                          </div>
                          <div className="text-muted-foreground/90 mt-0.5">
                            {error.step && (
                              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive rounded mr-2 capitalize">
                                {error.step}
                              </span>
                            )}
                            <span>{error.error}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Mostra messaggio se non ci sono file elaborati ma c'è un errore generale */}
              {!isProcessing && (!elaboration.total || elaboration.total === 0) && elaboration.status === 'error' && (!elaboration.errors || elaboration.errors.length === 0) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Errore durante l'elaborazione</AlertTitle>
                  <AlertDescription>
                    L'elaborazione non è riuscita. Espandi la sezione "Log di Elaborazione" qui sotto per maggiori dettagli.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Logs Section */}
        {(elaboration.status === 'error' || elaboration.status === 'interrupted' || elaboration.status === 'processing' || elaboration.status === 'elaborating' || elaboration.status === 'completed' || logs.length > 0) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Log di Elaborazione</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLogsExpanded(!logsExpanded);
                    if (!logsExpanded && logs.length === 0) {
                      loadLogs();
                    }
                  }}
                  className="gap-2"
                >
                  {logsExpanded ? (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Nascondi
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4" />
                      Mostra
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                Dettagli completi dell'elaborazione, inclusi aggiornamenti intermedi e errori
              </CardDescription>
            </CardHeader>
            {logsExpanded && (
              <CardContent>
                {loadingLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Caricamento log...</span>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nessun log disponibile</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {logs.map((log, index) => (
                      <div
                        key={log.id}
                        className={`border rounded-lg p-4 ${
                          log.status === 'error' || log.status === 'interrupted'
                            ? 'border-destructive/50 bg-destructive/5'
                            : log.status === 'completed'
                            ? 'border-green-500/50 bg-green-500/5'
                            : 'border-border bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                log.status === 'error' || log.status === 'interrupted'
                                  ? 'destructive'
                                  : log.status === 'completed'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {log.status || 'N/A'}
                            </Badge>
                            {log.stage && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {log.stage}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {log.createdAt
                              ? new Date(log.createdAt).toLocaleString('it-IT', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })
                              : '-'}
                          </span>
                        </div>
                        
                        {log.message && (
                          <div className="text-sm text-foreground mb-2">{log.message}</div>
                        )}
                        
                        {log.progress !== null && log.total !== null && log.total > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Progresso: {log.current || 0}/{log.total}</span>
                              <span>{log.progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={log.progress} className="h-1.5" />
                          </div>
                        )}
                        
                        {log.errors && log.errors.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {log.errors.map((error, errorIndex) => (
                              <div
                                key={errorIndex}
                                className="text-xs bg-destructive/10 border-l-2 border-destructive pl-2 py-1 rounded"
                              >
                                <div className="font-medium text-destructive">
                                  {error.filename || 'File sconosciuto'}
                                </div>
                                <div className="text-muted-foreground mt-0.5">
                                  {error.step && <span className="capitalize">{error.step}: </span>}
                                  {error.error}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Dettagli tecnici
                            </summary>
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Uploads List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Caricamenti</CardTitle>
              <CardDescription>
                Elenco dei caricamenti suddivisi per mansione, reparto e area. Clicca su un caricamento per vedere gli allegati.
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
              <div className="space-y-3">
                {uploads.map((upload) => {
                  const isExpanded = expandedUploads.has(upload.id);
                  return (
                    <Collapsible
                      key={upload.id}
                      open={isExpanded}
                      onOpenChange={() => toggleUploadExpansion(upload.id)}
                    >
                      <div className="border rounded-lg overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="text-muted-foreground">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex items-center gap-6 flex-1">
                                <div className="min-w-[140px]">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                                    <Briefcase className="h-3 w-3" />
                                    Mansione
                                  </div>
                                  <div className="font-medium">
                                    {upload.mansione || <span className="text-muted-foreground/50 italic">Non specificato</span>}
                                  </div>
                                </div>
                                <div className="min-w-[120px]">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                                    <Building className="h-3 w-3" />
                                    Reparto
                                  </div>
                                  <div className="font-medium">
                                    {upload.reparto || <span className="text-muted-foreground/50 italic">Non specificato</span>}
                                  </div>
                                </div>
                                <div className="min-w-[100px]">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                                    <User className="h-3 w-3" />
                                    Area
                                  </div>
                                  <div className="font-medium">
                                    {upload.area || <span className="text-muted-foreground/50 italic">Non specificato</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{upload.files.length} allegati</span>
                                </div>
                                
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(upload.createdAt || upload.created_at)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t bg-muted/20 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {upload.files.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center gap-3 p-3 bg-background border rounded-lg hover:border-primary/50 transition-colors group"
                                >
                                  <div className="p-2 bg-destructive/10 rounded-lg">
                                    <FileText className="h-5 w-5 text-destructive" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate" title={file.originalName || file.filename}>
                                      {file.originalName || file.filename}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size)}
                                    </div>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                        onClick={() => handlePreviewFile({
                                          ...file,
                                          mansione: upload.mansione || 'Non specificato',
                                          reparto: upload.reparto || 'Non specificato',
                                          area: upload.area || 'Non specificato'
                                        })}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Anteprima PDF</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteFileClick(upload.id, file.id)}
                                          className="hover:bg-destructive/10"
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive/70" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Elimina file</TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <NewUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          elaborationId={elaboration.id}
          companyId={elaboration.company_id}
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

        <AlertDialog open={deleteFileDialogOpen} onOpenChange={setDeleteFileDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare questo file? Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteFileConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma generazione Excel</AlertDialogTitle>
              <AlertDialogDescription>
                {elaboration?.status === 'completed' || elaboration?.status === 'error' || elaboration?.status === 'interrupted' 
                  ? "Vuoi rigenerare il file Excel? Il file esistente verrà sovrascritto."
                  : "Vuoi avviare la generazione del file Excel? Questa operazione potrebbe richiedere alcuni minuti."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmGenerateElaboration}
                disabled={generatingElaboration}
              >
                {generatingElaboration ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generazione in corso...
                  </>
                ) : (
                  "Conferma"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </TooltipProvider>
  );
}
