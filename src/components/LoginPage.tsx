import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ChefHat, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import SaladThree from './SaladThree';
import { apiService } from "../services/api";
import { Alert, AlertDescription } from "./ui/alert";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignup) {
        // Inscription
        if (!email || !password || !name) {
          setError("Veuillez remplir tous les champs");
          setIsLoading(false);
          return;
        }
        await apiService.register(email, name, password);
        // Après inscription, connecter automatiquement
        await apiService.login(email, password);
      } else {
        // Connexion
        if (!email || !password) {
          setError("Veuillez remplir tous les champs");
          setIsLoading(false);
          return;
        }
        await apiService.login(email, password);
      }

      // Succès : rediriger vers l'application
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
    setError(null); // Réinitialiser les erreurs
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="relative h-screen bg-background overflow-hidden">
      {/* Desktop: Two panels side by side with sliding animation */}
      <div className="hidden lg:flex h-full relative">
        {/* Container for sliding panels */}
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
            <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden">
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
                      <label className="text-xs sm:text-sm text-muted-foreground">
                        Nom complet
                      </label>
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
            {isSignup ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-2 text-primary hover:underline font-semibold"
            >
              {isSignup ? 'Se connecter' : 'S\'inscrire'}
            </button>
          </p>
        </div>

        {/* Demo Note */}
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center leading-snug">
            Mode démo : Cliquez sur "{isSignup ? 'Créer mon compte' : 'Se connecter'}" pour accéder à l'application
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Hero Section with Image
  const HeroSection = () => (
    <motion.div
      key={`hero-${animationKey}`}
      initial={{ 
        x: isSignup ? '100%' : '-100%',
        zIndex: 1
      }}
      animate={{ 
        x: 0,
        zIndex: 1
      }}
      exit={{ 
        x: isSignup ? '-100%' : '100%',
        zIndex: 10
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.65, 0, 0.35, 1]
      }}
      className="absolute inset-0 w-full h-full relative overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1623345260599-6f5cba600f6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcHJlcGFyYXRpb24lMjBjb29raW5nfGVufDF8fHx8MTc2MjMzMDY5OXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Cooking background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70"></div>
      </div>

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
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Form only, full width - Same form content */}
      <div className="lg:hidden w-full h-full">
        <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-hidden">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <span className="text-lg sm:text-xl display-font text-primary">Frig'Oh</span>
            </div>

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
                  <button type="button" className="text-xs sm:text-sm text-primary hover:underline">
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
        </div>
      </div>
    </div>
  );
}
