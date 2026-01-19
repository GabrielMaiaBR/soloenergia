import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUpdateSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

interface LogoUploadProps {
  currentLogoUrl?: string | null;
}

export function LogoUpload({ currentLogoUrl }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateSettings = useUpdateSettings();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem.");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    setUploading(true);

    try {
      // Create unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `company-logo-${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        // Update settings with new logo URL
        await updateSettings.mutateAsync({ logo_url: urlData.publicUrl });
        setPreviewUrl(urlData.publicUrl);
        toast.success("Logo atualizada com sucesso!");
      }
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error("Erro ao fazer upload: " + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await updateSettings.mutateAsync({ logo_url: null });
      setPreviewUrl(null);
      toast.success("Logo removida!");
    } catch (error: any) {
      toast.error("Erro ao remover logo: " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Logo da Empresa</Label>
      
      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Logo da empresa"
              className="w-full h-full object-contain"
            />
          ) : (
            <Image className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Enviando..." : "Fazer Upload"}
          </Button>
          {previewUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveLogo}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Formatos aceitos: JPG, PNG, SVG. Tamanho máximo: 2MB.
        A logo aparecerá nos relatórios e propostas.
      </p>
    </div>
  );
}
