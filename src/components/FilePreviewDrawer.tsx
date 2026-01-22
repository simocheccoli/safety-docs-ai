import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { FileText, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFilePreview, FilePreviewData } from '@/contexts/FilePreviewContext';
import { fetchFilePreview } from '@/lib/elaborationApi';
import { toast } from '@/hooks/use-toast';

function formatFileSize(bytes?: number) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreviewDrawer() {
  const { previewFile, isOpen, closePreview } = useFilePreview();
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    // Clean up previous blob URL when preview closes
    return () => {
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
      }
    };
  }, [previewBlobUrl]);

  useEffect(() => {
    if (!isOpen || !previewFile) {
      // Clean up blob URL when drawer closes
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
      }
      return;
    }

    // Fetch preview when drawer opens
    const loadPreview = async () => {
      if (!previewFile.previewUrl) {
        return;
      }

      setPreviewLoading(true);
      try {
        const blobUrl = await fetchFilePreview(previewFile.previewUrl);
        setPreviewBlobUrl(blobUrl);
      } catch (error) {
        console.error('Error fetching file preview:', error);
        toast({
          title: 'Errore',
          description: "Impossibile caricare l'anteprima del file",
          variant: 'destructive',
        });
      } finally {
        setPreviewLoading(false);
      }
    };

    loadPreview();
  }, [isOpen, previewFile]);

  const handleDownload = () => {
    if (previewFile?.previewUrl) {
      window.open(previewFile.previewUrl, '_blank');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closePreview()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-destructive" />
              <span className="truncate">{previewFile?.filename}</span>
            </SheetTitle>
            {previewFile?.previewUrl && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Scarica
              </Button>
            )}
          </div>
          {previewFile && (
            <>
              {previewFile.metadata && Object.keys(previewFile.metadata).length > 0 && (
                <div className="flex gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                  {Object.entries(previewFile.metadata).map(([key, value]) => 
                    value ? (
                      <div key={key} className="flex items-center gap-1.5">
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ) : null
                  )}
                </div>
              )}
              {previewFile.size && (
                <p className="text-sm text-muted-foreground mt-2">
                  Dimensione: {formatFileSize(previewFile.size)}
                </p>
              )}
            </>
          )}
        </SheetHeader>
        <div className="flex-1 bg-muted/30 overflow-hidden">
          {previewFile && (
            <>
              {previewLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Caricamento anteprima...</p>
                  </div>
                </div>
              ) : previewBlobUrl ? (
                <iframe
                  src={previewBlobUrl}
                  className="w-full h-full border-0"
                  title={`Anteprima di ${previewFile.filename}`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center p-8">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-destructive/50" />
                    <p className="font-medium mb-2">{previewFile.filename}</p>
                    {previewFile.size && (
                      <p className="text-sm mb-4">{formatFileSize(previewFile.size)}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {previewFile.previewUrl
                        ? "Errore nel caricamento dell'anteprima."
                        : "Anteprima non disponibile per questo file."}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
