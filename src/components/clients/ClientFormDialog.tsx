import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client, ClientStatus } from "@/types";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { useSettings } from "@/hooks/useSettings";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}

const statusOptions: { value: ClientStatus; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "analysis", label: "Em Análise" },
  { value: "closed", label: "Fechado" },
  { value: "lost", label: "Perdido" },
];

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const { data: settings } = useSettings();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const [formData, setFormData] = useState({
    name: client?.name || "",
    cpf: client?.cpf || "",
    phone: client?.phone || "",
    email: client?.email || "",
    status: client?.status || ("lead" as ClientStatus),
    system_power_kwp: client?.system_power_kwp?.toString() || "",
    monthly_generation_kwh: client?.monthly_generation_kwh?.toString() || "",
    energy_tariff: client?.energy_tariff?.toString() || settings?.default_tariff?.toString() || "0.85",
    notes: client?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const clientData = {
      name: formData.name,
      cpf: formData.cpf || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      status: formData.status,
      system_power_kwp: formData.system_power_kwp ? parseFloat(formData.system_power_kwp) : undefined,
      monthly_generation_kwh: formData.monthly_generation_kwh
        ? parseFloat(formData.monthly_generation_kwh)
        : undefined,
      energy_tariff: formData.energy_tariff ? parseFloat(formData.energy_tariff) : undefined,
      notes: formData.notes || undefined,
    };

    if (client) {
      await updateClient.mutateAsync({ id: client.id, ...clientData });
    } else {
      await createClient.mutateAsync(clientData);
    }

    onOpenChange(false);
  };

  const isLoading = createClient.isPending || updateClient.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ClientStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Dados do Projeto</h4>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="power">Potência (kWp)</Label>
                <Input
                  id="power"
                  type="number"
                  step="0.1"
                  value={formData.system_power_kwp}
                  onChange={(e) => setFormData({ ...formData, system_power_kwp: e.target.value })}
                  placeholder="8.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="generation">Geração (kWh/mês)</Label>
                <Input
                  id="generation"
                  type="number"
                  value={formData.monthly_generation_kwh}
                  onChange={(e) => setFormData({ ...formData, monthly_generation_kwh: e.target.value })}
                  placeholder="1100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tariff">Tarifa (R$/kWh)</Label>
                <Input
                  id="tariff"
                  type="number"
                  step="0.01"
                  value={formData.energy_tariff}
                  onChange={(e) => setFormData({ ...formData, energy_tariff: e.target.value })}
                  placeholder="0.85"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas sobre o cliente ou projeto..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : client ? "Salvar" : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
