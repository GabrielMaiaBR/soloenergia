import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sun, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

// Validation schemas
const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres");

type AuthMode = "login" | "signup" | "forgot-password";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, loading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    if (mode !== "forgot-password") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }

      if (mode === "signup" && password !== confirmPassword) {
        newErrors.confirmPassword = "Senhas não coincidem";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
          setMode("login");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email já está registrado. Tente fazer login.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Conta criada com sucesso! Você será redirecionado.");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error("Email ou senha inválidos.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Login realizado com sucesso!");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setPassword("");
    setConfirmPassword("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case "signup": return "Criar Conta";
      case "forgot-password": return "Recuperar Senha";
      default: return "Solo Smart";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "signup": return "Crie sua conta para acessar o sistema";
      case "forgot-password": return "Digite seu email para receber o link de recuperação";
      default: return "Entre com sua conta para continuar";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Hero Section (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12 text-primary-foreground">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-600 to-amber-600 opacity-90" />
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"
        />

        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-yellow-400/20 blur-3xl" />

        {/* Header content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-2xl font-bold mb-8">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <span>Solo Smart</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6 slide-in">
            Transforme o Sol em <br />
            <span className="text-yellow-200">Resultados Reais</span>
          </h1>

          <p className="text-xl text-primary-foreground/90 max-w-lg slide-in" style={{ animationDelay: "100ms" }}>
            A plataforma completa para gestão, vendas e dimensionamento de energia solar fotovoltaica.
          </p>
        </div>

        {/* Benefits List */}
        <div className="relative z-10 space-y-6 slide-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Propostas Irrecusáveis</h3>
              <p className="text-sm opacity-80">Gere propostas comerciais em segundos.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Análise Financeira</h3>
              <p className="text-sm opacity-80">Cálculos precisos de ROI, Payback e VPL.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Gestão Completa</h3>
              <p className="text-sm opacity-80">Pipeline CRM e controle de clientes.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm opacity-60">
          © 2026 Solo Smart. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />

        <div className="w-full max-w-md slide-in" style={{ animationDelay: "300ms" }}>
          <div className="text-center lg:hidden mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <Sun className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Solo Smart</h1>
          </div>

          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm lg:p-4">
            <CardHeader className="text-center space-y-2 pb-6">
              {mode === "forgot-password" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-6 top-6"
                  onClick={() => switchMode("login")}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              )}

              <CardTitle className="text-2xl font-bold tracking-tight">{getTitle()}</CardTitle>
              <CardDescription className="text-base">{getDescription()}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className={`h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive font-medium">{errors.email}</p>
                  )}
                </div>

                {mode !== "forgot-password" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className={`h-11 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive font-medium">{errors.password}</p>
                    )}
                  </div>
                )}

                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      className={`h-11 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive font-medium">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "signup" ? "Criando conta..." : mode === "forgot-password" ? "Enviando..." : "Entrando..."}
                    </>
                  ) : (
                    mode === "signup" ? "Criar Conta" : mode === "forgot-password" ? "Enviar Link de Recuperação" : "Entrar na Plataforma"
                  )}
                </Button>
              </form>

              {mode === "login" && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot-password")}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              )}

              {mode !== "forgot-password" && (
                <div className="mt-6 text-center pt-4 border-t">
                  <span className="text-sm text-muted-foreground mr-1">
                    {mode === "signup" ? "Já tem uma conta?" : "Não tem conta?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => switchMode(mode === "signup" ? "login" : "signup")}
                    className="text-sm font-semibold text-primary hover:underline underline-offset-4 transition-all"
                    disabled={isSubmitting}
                  >
                    {mode === "signup" ? "Faça login" : "Cadastre-se gratuitamente"}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
