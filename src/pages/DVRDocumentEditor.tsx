import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, RefreshCw, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { dvrApi } from "@/lib/dvrApi";
import { DVR } from "@/types/dvr";
import { toast } from "@/hooks/use-toast";
import { SuperDoc } from "@harbour-enterprises/superdoc";
import "@harbour-enterprises/superdoc/style.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function DVRDocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dvr, setDvr] = useState<DVR | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const superDocRef = useRef<any>(null);
  const superDocContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadDVR();
    }
  }, [id]);

  const loadDVR = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const dvrData = await dvrApi.getDVR(id);
      
      if (dvrData) {
        setDvr(dvrData);
        setDocumentTitle(dvrData.nome);
      } else {
        toast({
          title: "Errore",
          description: "DVR non trovato",
          variant: "destructive",
        });
        navigate('/dvr');
      }
    } catch (error) {
      console.error("Errore caricamento DVR:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il DVR",
        variant: "destructive",
      });
      navigate('/dvr');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dvr?.final_document_path && superDocContainerRef.current) {
      // Se c'è già un'istanza, distruggi e ricrea con il nuovo documento
      if (superDocRef.current) {
        try {
          superDocRef.current.destroy();
        } catch (e) {
          console.log('Cleanup SuperDoc:', e);
        }
        superDocRef.current = null;
      }
      initializeSuperDoc();
    }
    
    return () => {
      if (superDocRef.current) {
        try {
          superDocRef.current.destroy();
        } catch (e) {
          console.log('Cleanup SuperDoc:', e);
        }
        superDocRef.current = null;
      }
    };
  }, [dvr?.final_document_path]);

  const initializeSuperDoc = async () => {
    if (!dvr?.final_document_path) return;
    
    try {
      if (superDocContainerRef.current) {
        // Scarica il documento dal path
        const downloadUrl = `${API_BASE_URL}/api/dvrs/${id}/download`;
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error("Impossibile scaricare il documento");
        }
        
        const blob = await response.blob();
        const documentToLoad = URL.createObjectURL(blob);
        
        superDocRef.current = new SuperDoc({
          selector: '#superdoc-container',
          toolbar: '#superdoc-toolbar',
          document: documentToLoad,
          documentMode: 'editing',
          pagination: true,
          rulers: true,
          onReady: (event: any) => {
            console.log('SuperDoc pronto', event);
            toast({
              title: "Editor Caricato",
              description: "Documento caricato con successo",
            });
          },
          onEditorCreate: (event: any) => {
            console.log('Editor SuperDoc creato', event);
          },
          onError: (error: any) => {
            console.error('SuperDoc error:', error);
            toast({
              title: "Errore Editor",
              description: "Impossibile caricare il documento nell'editor",
              variant: "destructive",
            });
          }
        });
      }
    } catch (error) {
      console.error('Errore inizializzazione SuperDoc:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'editor SuperDoc",
        variant: "destructive",
      });
    }
  };

  const handleExportDocx = async () => {
    if (!superDocRef.current) return;
    
    try {
      const blob = await superDocRef.current.exportAsDocx();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentTitle}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Documento Esportato",
        description: "Il documento è stato scaricato come file DOCX",
      });
    } catch (error) {
      console.error('Errore esportazione DOCX:', error);
      toast({
        title: "Errore",
        description: "Impossibile esportare il documento",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = async () => {
    if (!id) return;
    
    try {
      setRegenerating(true);
      await dvrApi.regenerateDocument(id);
      
      // Ricarica il DVR per ottenere il nuovo final_document_path
      const updatedDvr = await dvrApi.getDVR(id);
      if (updatedDvr) {
        setDvr(updatedDvr);
      }
      
      toast({
        title: "Documento Rigenerato",
        description: "Il documento è stato rigenerato dal template con successo",
      });
    } catch (error) {
      console.error('Errore rigenerazione:', error);
      toast({
        title: "Errore",
        description: "Impossibile rigenerare il documento",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  if (loading || !dvr) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/dvr/${id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col">
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                placeholder="Titolo documento"
              />
              <p className="text-xs text-muted-foreground">
                Revisione {dvr.numero_revisione}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              Rigenera da Template
            </Button>
            {dvr.final_document_path && (
              <Button 
                variant="outline" 
                onClick={handleExportDocx}
              >
                <Download className="h-4 w-4 mr-2" />
                Esporta DOCX
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-screen-2xl mx-auto p-4">
          {!dvr.final_document_path ? (
            <Alert className="max-w-2xl mx-auto mt-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Documento non ancora generato</AlertTitle>
              <AlertDescription>
                Non è ancora stato generato un documento per questo DVR. 
                Clicca su "Rigenera da Template" per creare il documento iniziale.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="h-full flex flex-col space-y-2">
              <div id="superdoc-toolbar" className="border rounded-lg p-2 bg-background"></div>
              <div 
                id="superdoc-container" 
                ref={superDocContainerRef}
                className="flex-1 border rounded-lg overflow-auto bg-background"
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}