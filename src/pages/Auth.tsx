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
import { Sun, Loader2, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {mode === "forgot-password" && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => switchMode("login")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          )}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Sun className="h-8 w-8 text-background" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
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
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
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
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
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
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "signup" ? "Criando conta..." : mode === "forgot-password" ? "Enviando..." : "Entrando..."}
                </>
              ) : (
                mode === "signup" ? "Criar Conta" : mode === "forgot-password" ? "Enviar Link" : "Entrar"
              )}
            </Button>
          </form>
          
          {mode === "login" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => switchMode("forgot-password")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                disabled={isSubmitting}
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}
          
          {mode !== "forgot-password" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => switchMode(mode === "signup" ? "login" : "signup")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                disabled={isSubmitting}
              >
                {mode === "signup" 
                  ? "Já tem uma conta? Faça login" 
                  : "Não tem conta? Cadastre-se"
                }
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
