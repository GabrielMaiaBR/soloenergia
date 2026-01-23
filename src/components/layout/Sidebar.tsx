import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Settings, Sun, Menu, X, LogOut, Calculator, Kanban, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";

export function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { data: settings } = useSettings();
  const { data: clients = [] } = useClients();

  // Calculate clients needing attention
  const followUpDays = settings?.follow_up_days || 7;
  const attentionCount = useMemo(() => {
    return clients.filter(client => {
      const daysSinceContact = client.last_contact_date
        ? Math.floor((Date.now() - new Date(client.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      return client.needs_attention || (daysSinceContact !== null && daysSinceContact >= followUpDays);
    }).length;
  }, [clients, followUpDays]);

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/calculator", icon: Calculator, label: "Calculadora" },
    {
      to: "/pipeline",
      icon: Kanban,
      label: "Pipeline",
      badge: clients.length > 0 ? clients.length : undefined
    },
    { to: "/settings", icon: Settings, label: "Configurações" },
  ];

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Erro ao sair: " + error.message);
    } else {
      toast.success("Logout realizado com sucesso!");
    }
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-sidebar transition-transform duration-300 md:translate-x-0 md:static md:h-auto md:min-h-screen",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo - Dinâmico */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.company_name || "Logo"}
                className="h-10 w-10 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Sun className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {settings?.company_name || "Solo Smart"}
              </h1>
              <p className="text-xs text-muted-foreground">Copiloto Financeiro</p>
            </div>
          </div>

          {/* Attention Alert */}
          {attentionCount > 0 && (
            <div className="mx-4 mt-4 p-3 rounded-lg bg-solo-danger/10 border border-solo-danger/30 animate-attention-pulse">
              <div className="flex items-center gap-2 text-solo-danger">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {attentionCount} cliente{attentionCount > 1 && 's'} precisa{attentionCount > 1 && 'm'} de atenção
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-1"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("h-5 w-5", isActive && "animate-scale-in")} />
                    {item.label}
                  </div>
                  {item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer with user info and logout */}
          <div className="border-t border-border p-4 space-y-3">
            {user && (
              <p className="text-xs text-muted-foreground truncate text-center">
                {user.email}
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-destructive transition-colors-slow"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              v2.0.0 • Solo Smart
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
