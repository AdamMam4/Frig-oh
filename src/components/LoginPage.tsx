import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ChefHat, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [animationKey, setAnimationKey] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login même si les champs sont vides
    onLogin();
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setAnimationKey(prev => prev + 1); // Force nouvelle animation
  };

  // Form Component
  const FormSection = () => (
    <motion.div
      key={`form-${animationKey}`}
      initial={{ x: isSignup ? '-100%' : '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isSignup ? '100%' : '-100%', opacity: 0.5 }}
      transition={{ 
        duration: 0.7, 
        ease: [0.65, 0, 0.35, 1],
        opacity: { duration: 0.4 }
      }}
      className="w-full h-full flex items-center justify-center p-12 bg-background"
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20">
            <ChefHat className="w-7 h-7 text-primary" />
          </div>
          <span className="text-2xl display-font text-primary">Chef Gourmet</span>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl mb-3 display-font">
            {isSignup ? 'Créer un compte' : 'Bienvenue'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isSignup 
              ? 'Rejoignez notre communauté de gourmets' 
              : 'Connectez-vous à votre compte'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {isSignup && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Jean Dupont"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-12 bg-card border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="chef@gourmet.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 bg-card border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-12 bg-card border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {!isSignup && (
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-black group"
            >
              {isSignup ? 'Créer mon compte' : 'Se connecter'}
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Button>
          </div>
        </form>

        {/* Toggle */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
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
        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground text-center">
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
      initial={{ x: isSignup ? '100%' : '-100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isSignup ? '-100%' : '100%', opacity: 0.5 }}
      transition={{ 
        duration: 0.7, 
        ease: [0.65, 0, 0.35, 1],
        opacity: { duration: 0.4 }
      }}
      className="w-full h-full relative overflow-hidden"
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

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ChefHat className="w-12 h-12" />
          </div>
        </div>

        <div className="text-center max-w-lg">
          <h2 className="text-5xl mb-4 display-font">
            {isSignup 
              ? 'Commencez votre aventure culinaire' 
              : 'Découvrez de nouvelles saveurs'}
          </h2>
          <p className="text-xl text-white/90 leading-relaxed">
            {isSignup
              ? 'Créez des recettes uniques avec vos ingrédients préférés'
              : 'Transformez vos ingrédients en délicieux repas'}
          </p>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 left-20 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm"
        />
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {isSignup ? (
          <>
            {/* Hero on left when signup */}
            <div key={`hero-left-${animationKey}`} className="w-1/2">
              <HeroSection />
            </div>
            {/* Form on right when signup */}
            <div key={`form-right-${animationKey}`} className="w-1/2">
              <FormSection />
            </div>
          </>
        ) : (
          <>
            {/* Form on left when login */}
            <div key={`form-left-${animationKey}`} className="w-1/2">
              <FormSection />
            </div>
            {/* Hero on right when login */}
            <div key={`hero-right-${animationKey}`} className="w-1/2">
              <HeroSection />
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
