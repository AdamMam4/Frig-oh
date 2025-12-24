import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ChefHat, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import SaladThree from "./SaladThree";
import { apiService } from "../services/api";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [animationKey, setAnimationKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for "forgot password"
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<"email" | "reset">("email");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignup) {
        // Sign up
        if (!email || !password || !name) {
          setError("Veuillez remplir tous les champs");
          setIsLoading(false);
          return;
        }
        await apiService.register(email, name, password);
        // After sign up, log in automatically
        await apiService.login(email, password);
      } else {
        // Sign in
        if (!email || !password) {
          setError("Veuillez remplir tous les champs");
          setIsLoading(false);
          return;
        }
        await apiService.login(email, password);
      }

      // Success: redirect to the app
      onLogin();
    } catch (err) {
      console.error("Erreur d'authentification:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setAnimationKey((prev) => prev + 1);
    setError(null);
    setEmail("");
    setPassword("");
    setName("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);

    try {
      if (forgotStep === "email") {
        const response = await apiService.forgotPassword(forgotEmail);
        if (response.email_sent) {
          setForgotSuccess(
            "Un code de réinitialisation a été envoyé à votre adresse email. Vérifiez votre boîte de réception."
          );
        } else if (response.reset_code) {
          // Dev mode: email is not configured, show the code
          setForgotSuccess(`Code de développement : ${response.reset_code}`);
        } else {
          setForgotSuccess("Si cet email existe, un code de réinitialisation a été envoyé.");
        }
        setForgotStep("reset");
      } else {
        await apiService.resetPassword(resetToken, newPassword);
        setForgotSuccess(
          "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter."
        );
        setTimeout(() => {
          setShowForgotPassword(false);
          resetForgotPasswordState();
        }, 2000);
      }
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotPasswordState = () => {
    setForgotEmail("");
    setResetToken("");
    setNewPassword("");
    setForgotStep("email");
    setForgotError(null);
    setForgotSuccess(null);
  };

  const openForgotPassword = () => {
    resetForgotPasswordState();
    setShowForgotPassword(true);
  };

  // Form Component
  const FormSection = () => (
    <motion.div
      key={`form-${animationKey}`}
      initial={{
        x: isSignup ? "-100%" : "100%",
        zIndex: 10,
      }}
      animate={{
        x: 0,
        zIndex: 10,
      }}
      exit={{
        x: isSignup ? "100%" : "-100%",
        zIndex: 1,
      }}
      transition={{
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1],
      }}
      className="absolute inset-0 w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden"
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20">
            <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <span className="text-lg sm:text-xl display-font text-primary">Frig'Oh</span>
        </div>

        {/* Title */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl mb-1.5 sm:mb-2 display-font">
            {isSignup ? "Créer un compte" : "Bienvenue"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isSignup
              ? "Rejoignez notre communauté de gourmets"
              : "Connectez-vous à votre compte"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {isSignup && (
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm text-muted-foreground">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-10 sm:h-11 text-sm bg-card border-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="chef@gourmet.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-10 sm:h-11 text-sm bg-card border-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm text-muted-foreground">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-10 sm:h-11 text-sm bg-card border-primary/20 focus:border-primary"
                required
                minLength={6}
              />
            </div>
          </div>

          {!isSignup && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-xs sm:text-sm text-primary hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="pt-1">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 sm:h-11 bg-primary hover:bg-primary/90 text-black group"
            >
              <span className="text-sm">
                {isLoading
                  ? isSignup
                    ? "Création en cours..."
                    : "Connexion en cours..."
                  : isSignup
                    ? "Créer mon compte"
                    : "Se connecter"}
              </span>
              {!isLoading && (
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              )}
            </Button>
          </div>
        </form>

        {/* Toggle */}
        <div className="mt-4 sm:mt-5 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isSignup ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-2 text-primary hover:underline font-semibold"
            >
              {isSignup ? "Se connecter" : "S'inscrire"}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Hero Section with SaladThree
  const HeroSection = () => (
    <motion.div
      key={`hero-${animationKey}`}
      initial={{
        x: isSignup ? "100%" : "-100%",
        zIndex: 1,
      }}
      animate={{
        x: 0,
        zIndex: 1,
      }}
      exit={{
        x: isSignup ? "-100%" : "100%",
        zIndex: 10,
      }}
      transition={{
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1],
      }}
      className="absolute inset-0 w-full h-full relative overflow-hidden"
    >
      {/* 3D Background with SaladThree */}
      <div className="absolute inset-0 bg-primary/90">
        <SaladThree className="w-full h-full opacity-40" />
      </div>

      {/* Overlay gradient to improve readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-transparent" />

      <div className="relative h-full flex flex-col items-center justify-center p-6 sm:p-8 text-white">
        <div className="mb-5 sm:mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ChefHat className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
          </div>
        </div>

        <div className="text-center max-w-lg px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-2.5 sm:mb-3 display-font leading-tight">
            {isSignup
              ? "Commencez votre aventure culinaire"
              : "Découvrez de nouvelles saveurs"}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed">
            {isSignup
              ? "Créez des recettes uniques avec vos ingrédients préférés"
              : "Transformez vos ingrédients en délicieux repas"}
          </p>
        </div>

        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 sm:top-20 right-10 sm:right-20 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 sm:bottom-32 left-10 sm:left-20 w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm"
        />
      </div>
    </motion.div>
  );

  return (
    <div className="relative h-screen bg-background overflow-hidden">
      {/* Desktop: Two panels side by side with sliding animation */}
      <div className="hidden lg:flex h-full relative">
        <div className="relative w-full h-full flex">
          {/* Form Section - slides left/right */}
          <div
            className="w-1/2 h-full relative"
            style={{
              position: "absolute",
              left: isSignup ? "50%" : "0%",
              transition: "left 0.8s cubic-bezier(0.65, 0, 0.35, 1)",
            }}
          >
            <FormSection />
          </div>

          {/* Hero Section - slides left/right */}
          <div
            className="w-1/2 h-full relative"
            style={{
              position: "absolute",
              left: isSignup ? "0%" : "50%",
              transition: "left 0.8s cubic-bezier(0.65, 0, 0.35, 1)",
            }}
          >
            <HeroSection />
          </div>
        </div>
      </div>

      {/* Mobile: Form only */}
      <div className="lg:hidden w-full h-full">
        <FormSection />
      </div>

      {/* "Forgot password" modal */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="display-font text-xl">
              {forgotStep === "email" ? "Mot de passe oublié" : "Réinitialiser le mot de passe"}
            </DialogTitle>
            <DialogDescription>
              {forgotStep === "email"
                ? "Entrez votre email pour recevoir un code de réinitialisation"
                : "Entrez le code reçu et votre nouveau mot de passe"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            {forgotStep === "email" ? (
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="chef@gourmet.fr"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm text-muted-foreground">Code de réinitialisation</label>
                  <Input
                    type="text"
                    placeholder="Collez le code ici"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-muted-foreground">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </>
            )}

            {forgotError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{forgotError}</AlertDescription>
              </Alert>
            )}

            {forgotSuccess && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">{forgotSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {forgotStep === "reset" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotStep("email")}
                  className="flex-1"
                >
                  Retour
                </Button>
              )}
              <Button
                type="submit"
                disabled={forgotLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-black"
              >
                {forgotLoading
                  ? "Chargement..."
                  : forgotStep === "email"
                    ? "Envoyer le code"
                    : "Réinitialiser"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
