import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Save } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    lei14300Factor: 85,
    defaultTariff: 0.85,
    companyName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const handleSave = () => {
    // TODO: Save to database
    console.log("Settings saved:", settings);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground">Personalize o Solo Smart para seu negócio</p>
      </div>

      {/* Lei 14.300 Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Lei 14.300</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="lei-factor">Fator de Compensação (Fio B)</Label>
              <span className="text-sm font-medium">{settings.lei14300Factor}%</span>
            </div>
            <Slider
              id="lei-factor"
              value={[settings.lei14300Factor]}
              onValueChange={([value]) => setSettings({ ...settings, lei14300Factor: value })}
              min={50}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Define quanto da geração é efetivamente compensada após aplicação da Lei 14.300.
              Valores típicos: 85% (residencial) a 90% (comercial).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tariff">Tarifa Padrão (R$/kWh)</Label>
            <Input
              id="tariff"
              type="number"
              step="0.01"
              value={settings.defaultTariff}
              onChange={(e) => setSettings({ ...settings, defaultTariff: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Nome da Empresa</Label>
            <Input
              id="company"
              placeholder="Sua Empresa Solar"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp / Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@empresa.com"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Essas informações aparecerão nos relatórios enviados aos clientes.
          </p>
        </CardContent>
      </Card>

      {/* Backup */}
      <Card>
        <CardHeader>
          <CardTitle>Backup de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Exporte seus dados periodicamente para garantir que não perca informações importantes.
          </p>
          <div className="flex gap-4">
            <Button variant="outline">Exportar Dados (JSON)</Button>
            <Button variant="outline">Importar Backup</Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="gap-2">
        <Save className="h-4 w-4" />
        Salvar Configurações
      </Button>
    </div>
  );
}
