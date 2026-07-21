import { useEffect, useState } from "react";
import { ExternalLink, Loader2, FileText, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getDocumentSignedUrl } from "@/lib/queries";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string | null | undefined;
  name?: string | null;
};

function extOf(path?: string | null) {
  if (!path) return "";
  const clean = path.split("?")[0].split("#")[0];
  const dot = clean.lastIndexOf(".");
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : "";
}

export function DocumentPreviewDialog({ open, onOpenChange, filePath, name }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ext = extOf(name) || extOf(filePath);
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext);
  const isPdf = ext === "pdf";
  const canPreview = isImage || isPdf;

  useEffect(() => {
    if (!open || !filePath) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setUrl(null);
    getDocumentSignedUrl(filePath)
      .then((u) => { if (!cancelled) setUrl(u); })
      .catch((e) => { if (!cancelled) setError(e.message ?? "Falha ao carregar."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, filePath]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-3 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{name ?? "Pré-visualização"}</DialogTitle>
        </DialogHeader>
        <div className="relative h-[70vh] w-full overflow-hidden rounded-lg border bg-muted/40">
          {loading && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
          {!loading && error && (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-destructive">{error}</div>
          )}
          {!loading && !error && url && canPreview && isPdf && (
            <iframe src={`${url}#toolbar=0`} title={name ?? "PDF"} className="h-full w-full" />
          )}
          {!loading && !error && url && canPreview && isImage && (
            <div className="flex h-full items-center justify-center bg-black/40">
              <img src={url} alt={name ?? "Documento"} className="max-h-full max-w-full object-contain" />
            </div>
          )}
          {!loading && !error && url && !canPreview && (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
              <FileText className="size-10 text-gold-strong" />
              <p>Pré-visualização não disponível para este formato{ext ? ` (.${ext})` : ""}.</p>
              <p>Use "Abrir em nova aba" para baixar ou visualizar.</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
          {url && (
            <>
              <Button asChild variant="outline" size="sm">
                <a href={url} download={name ?? undefined}>
                  <Download className="mr-2 size-4" /> Baixar
                </a>
              </Button>
              <Button asChild size="sm">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 size-4" /> Abrir em nova aba
                </a>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
