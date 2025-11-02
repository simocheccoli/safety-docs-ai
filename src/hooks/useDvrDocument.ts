import { useState, useEffect, useCallback } from 'react';
import { dvrApi } from '@/lib/dvrApi';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface UseDvrDocumentOptions {
  dvrId: string;
  autoSaveDelay?: number; // Debounce delay in ms (0 = disabled)
}

interface UseDvrDocumentReturn {
  html: string;
  setHtml: (html: string) => void;
  loading: boolean;
  saving: boolean;
  regenerating: boolean;
  exporting: boolean;
  error: string | null;
  docxPath: string | null;
  saveDocument: () => Promise<void>;
  regenerateDocument: (template?: string) => Promise<void>;
  exportDocument: (format: 'docx' | 'pdf') => Promise<void>;
}

export function useDvrDocument({ dvrId, autoSaveDelay = 0 }: UseDvrDocumentOptions): UseDvrDocumentReturn {
  const [html, setHtml] = useState<string>('');
  const [docxPath, setDocxPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load document on mount
  useEffect(() => {
    loadDocument();
  }, [dvrId]);

  // Auto-save with debounce (if enabled)
  useEffect(() => {
    if (autoSaveDelay > 0 && html && !loading) {
      const timer = setTimeout(() => {
        saveDocument();
      }, autoSaveDelay);

      return () => clearTimeout(timer);
    }
  }, [html, autoSaveDelay, loading]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dvrApi.getDocument(dvrId);
      setHtml(response.html || '');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore nel caricamento del documento';
      setError(message);
      toast({
        title: 'Errore',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = useCallback(async () => {
    if (!html || saving) return;

    try {
      setSaving(true);
      setError(null);
      await dvrApi.updateDocument(dvrId, html);
      toast({
        title: 'Documento salvato',
        description: 'Le modifiche sono state salvate con successo',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore nel salvataggio del documento';
      setError(message);
      
      // Handle validation errors (422)
      if (err instanceof Error && err.message.includes('422')) {
        toast({
          title: 'Errore di validazione',
          description: 'Verifica che tutti i campi siano compilati correttamente',
          variant: 'destructive',
        });
      } else if (err instanceof Error && err.message.includes('500')) {
        toast({
          title: 'Errore interno',
          description: 'Si è verificato un errore. Riprova più tardi',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Errore',
          description: message,
          variant: 'destructive',
        });
      }
      throw err;
    } finally {
      setSaving(false);
    }
  }, [dvrId, html, saving]);

  const regenerateDocument = useCallback(async (template?: string) => {
    try {
      setRegenerating(true);
      setError(null);
      const response = await dvrApi.regenerateDocument(dvrId, template);
      setHtml(response.html);
      setDocxPath(response.docx_path);
      toast({
        title: 'Documento rigenerato',
        description: 'Il documento è stato rigenerato dal template',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore nella rigenerazione del documento';
      setError(message);
      toast({
        title: 'Errore',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setRegenerating(false);
    }
  }, [dvrId]);

  const exportDocument = useCallback(async (format: 'docx' | 'pdf') => {
    try {
      setExporting(true);
      setError(null);
      const response = await dvrApi.exportDocument(dvrId, format);
      
      // Open the exported document in a new tab
      const fileUrl = `${API_BASE_URL}/storage/${response.path}`;
      window.open(fileUrl, '_blank');
      
      toast({
        title: 'Documento esportato',
        description: `Il documento è stato esportato come ${format.toUpperCase()}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : `Errore nell'esportazione ${format.toUpperCase()}`;
      setError(message);
      
      // Handle 501 (PDF not configured)
      if (err instanceof Error && err.message.includes('501')) {
        toast({
          title: 'Funzionalità non disponibile',
          description: 'L\'esportazione PDF non è ancora configurata',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Errore',
          description: message,
          variant: 'destructive',
        });
      }
      throw err;
    } finally {
      setExporting(false);
    }
  }, [dvrId]);

  return {
    html,
    setHtml,
    loading,
    saving,
    regenerating,
    exporting,
    error,
    docxPath,
    saveDocument,
    regenerateDocument,
    exportDocument,
  };
}
