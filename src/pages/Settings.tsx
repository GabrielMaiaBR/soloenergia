import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Download, Moon, Sun } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useClients } from "@/hooks/useClients";
import { useTheme } from "@/hooks/useTheme";
import { LogoUpload } from "@/components/settings/LogoUpload";
import { toast } from "sonner";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { data: clients = [] } = useClients();
  const updateSettings = useUpdateSettings();
  const { theme, toggleTheme, palette, setPalette } = useTheme();

  const handleSave = async (updates: Partial<typeof settings>) => {
    if (!settings) return;
    await updateSettings.mutateAsync(updates);
  };

  const handleExport = () => {
    const data = { clients, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solosmart-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado!");
  };

  if (isLoading || !settings) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground">Personalize o Solo Smart para seu negócio</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader><CardTitle>Aparência</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo Escuro</Label>
              <p className="text-xs text-muted-foreground">Alternar entre tema claro e escuro</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Palette Selector */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <Label>Paleta de Cores</Label>
              <p className="text-xs text-muted-foreground">Escolha o tema visual do aplicativo</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Classic Palette */}
              <div
                onClick={() => setPalette("classic")}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${palette === "classic"
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#0F2A44]" />
                  <span className="font-medium text-sm">Clássico</span>
                </div>
                <p className="text-xs text-muted-foreground">Azul técnico profissional</p>
                <div className="flex gap-1 mt-2">
                  <div className="w-3 h-3 rounded bg-[#0F2A44]" title="Primary" />
                  <div className="w-3 h-3 rounded bg-[#2D9CDB]" title="Accent" />
                  <div className="w-3 h-3 rounded bg-[#27AE60]" title="Success" />
                  <div className="w-3 h-3 rounded bg-[#F2C94C]" title="Warning" />
                </div>
              </div>

              {/* Solar Palette */}
              <div
                onClick={() => setPalette("solar")}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${palette === "solar"
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#E55A2B]" />
                  <span className="font-medium text-sm">Solo Energia</span>
                </div>
                <p className="text-xs text-muted-foreground">Laranja solar vibrante</p>
                <div className="flex gap-1 mt-2">
                  <div className="w-3 h-3 rounded bg-[#E55A2B]" title="Primary" />
                  <div className="w-3 h-3 rounded bg-[#F5A623]" title="Accent" />
                  <div className="w-3 h-3 rounded bg-[#27AE60]" title="Success" />
                  <div className="w-3 h-3 rounded bg-[#DC2626]" title="Danger" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lei 14.300 */}
      <Card>
        <CardHeader><CardTitle>Lei 14.300</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Fator de Compensação (Fio B)</Label>
              <span className="text-sm font-medium">{(settings.lei_14300_factor * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[settings.lei_14300_factor * 100]}
              onValueChange={([value]) => handleSave({ lei_14300_factor: value / 100 })}
              min={50} max={100} step={1}
            />
            <p className="text-xs text-muted-foreground">Define quanto da geração é compensada após a Lei 14.300.</p>
          </div>
          <div className="space-y-2">
            <Label>Tarifa Padrão (R$/kWh)</Label>
            <Input
              type="number" step="0.01"
              value={settings.default_tariff}
              onChange={(e) => handleSave({ default_tariff: parseFloat(e.target.value) || 0.85 })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <LogoUpload currentLogoUrl={settings.logo_url} />

          <div className="space-y-2">
            <Label>Nome da Empresa</Label>
            <Input
              placeholder="Sua Empresa Solar"
              value={settings.company_name || ""}
              onChange={(e) => handleSave({ company_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp / Telefone</Label>
            <Input
              placeholder="(11) 99999-9999"
              value={settings.contact_phone || ""}
              onChange={(e) => handleSave({ contact_phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              type="email" placeholder="contato@empresa.com"
              value={settings.contact_email || ""}
              onChange={(e) => handleSave({ contact_email: e.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground">Aparecerão nos relatórios enviados aos clientes.</p>
        </CardContent>
      </Card>

      {/* WhatsApp & Follow-up */}
      <Card>
        <CardHeader><CardTitle>WhatsApp e Follow-up</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Meu WhatsApp Pessoal</Label>
            <Input
              placeholder="(85) 99999-9999"
              value={settings.whatsapp_number || ""}
              onChange={(e) => handleSave({ whatsapp_number: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Propostas e análises serão enviadas primeiro para este número para sua revisão.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Alerta de Follow-up (dias)</Label>
              <span className="text-sm font-medium">{settings.follow_up_days || 7} dias</span>
            </div>
            <Slider
              value={[settings.follow_up_days || 7]}
              onValueChange={([value]) => handleSave({ follow_up_days: value })}
              min={1} max={30} step={1}
            />
            <p className="text-xs text-muted-foreground">
              Clientes sem contato há mais de X dias serão destacados para follow-up.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Backup */}
      <Card>
        <CardHeader><CardTitle>Backup de Dados</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Exporte seus dados para garantir que não perca informações.</p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
