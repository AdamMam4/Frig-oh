import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import {
  User,
  Moon,
  Sun,
  Heart,
  LogOut,
  Crown,
  Loader2,
  Pencil,
  Lock,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { apiService, UserStats } from "../services/api";
import { FavoritesPage } from "./FavoritesPage";

interface ProfilePageProps {
  onLogout: () => void;
}

export function ProfilePage({ onLogout }: ProfilePageProps) {
  const { theme, toggleTheme } = useTheme();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);

  // Modal états
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [passwordStep, setPasswordStep] = useState<"request" | "verify">("request");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    if (!apiService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const stats = await apiService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Modifier le nom d'utilisateur
  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername.length < 3) {
      setModalError("Le nom doit contenir au moins 3 caractères");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      const result = await apiService.updateUsername(newUsername);
      setUserStats((prev) => (prev ? { ...prev, username: result.username } : null));
      setModalSuccess("Nom d'utilisateur mis à jour !");
      setTimeout(() => {
        setShowUsernameModal(false);
        setNewUsername("");
        setModalSuccess("");
      }, 1500);
    } catch (error: any) {
      setModalError(error.message || "Erreur lors de la mise à jour");
    } finally {
      setModalLoading(false);
    }
  };

  // Demander un code pour changer le mot de passe
  const handleRequestPasswordChange = async () => {
    setModalLoading(true);
    setModalError("");
    setDevCode(null);

    try {
      const result = await apiService.requestPasswordChange();
      if (result.email_sent) {
        setPasswordStep("verify");
      } else if (result.reset_code) {
        // Mode dev: afficher le code
        setDevCode(result.reset_code);
        setPasswordStep("verify");
      }
    } catch (error: any) {
      setModalError(error.message || "Erreur lors de l'envoi du code");
    } finally {
      setModalLoading(false);
    }
  };

  // Vérifier le code et changer le mot de passe
  const handleVerifyPasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setModalError("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      setModalError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      await apiService.verifyPasswordChange(verificationCode, newPassword);
      setModalSuccess("Mot de passe modifié avec succès !");
      setTimeout(() => {
        setShowPasswordModal(false);
        resetPasswordModal();
      }, 1500);
    } catch (error: any) {
      setModalError(error.message || "Code invalide ou expiré");
    } finally {
      setModalLoading(false);
    }
  };

  const resetPasswordModal = () => {
    setPasswordStep("request");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setDevCode(null);
    setModalError("");
    setModalSuccess("");
  };

  // Si on affiche les favoris
  if (showFavorites) {
    return (
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-6xl mx-auto p-6">
          <Button variant="ghost" onClick={() => setShowFavorites(false)} className="mb-4">
            ← Retour au profil
          </Button>
        </div>
        <FavoritesPage />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-5xl mb-2 display-font text-primary">Profil</h1>
          <p className="text-muted-foreground text-lg">Gérez vos préférences culinaires</p>
        </div>

        {/* Profile Header */}
        <Card className="bg-card border-primary/20">
          <CardContent className="pt-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <Avatar className="w-28 h-28 border-4 border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <User className="w-14 h-14" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1.5">
                    <Crown className="w-4 h-4 text-black" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl mb-1 display-font">
                    {userStats?.username || "Chef Étoilé"}
                  </h2>
                  <p className="text-muted-foreground">{userStats?.email || "chef@gourmet.fr"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border-primary/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2 display-font text-primary">
                {loading ? "-" : userStats?.total_recipes || 0}
              </div>
              <p className="text-muted-foreground">Recettes</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-primary/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2 display-font text-primary">
                {loading ? "-" : userStats?.favorites_count || 0}
              </div>
              <p className="text-muted-foreground">Favoris</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-primary/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2 display-font text-primary">
                {loading ? "-" : userStats?.ai_generated_recipes || 0}
              </div>
              <p className="text-muted-foreground">Créées par IA</p>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card className="bg-card border-primary/20">
          <CardHeader>
            <h3 className="text-2xl display-font">Paramètres</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
              <div className="flex items-center gap-4">
                {theme === "dark" ? (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-primary" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sun className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <Label htmlFor="theme-mode" className="text-base">
                    Mode sombre
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Basculer entre les thèmes clair et sombre
                  </p>
                </div>
              </div>
              <Switch id="theme-mode" checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>

            {/* Modifier le nom */}
            <button
              onClick={() => {
                setNewUsername(userStats?.username || "");
                setModalError("");
                setModalSuccess("");
                setShowUsernameModal(true);
              }}
              className="flex items-center justify-between p-4 rounded-xl bg-background/50 w-full hover:bg-background/80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Pencil className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-base font-medium">Modifier le nom</p>
                  <p className="text-sm text-muted-foreground">Changer votre nom d'affichage</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Modifier le mot de passe */}
            <button
              onClick={() => {
                resetPasswordModal();
                setShowPasswordModal(true);
              }}
              className="flex items-center justify-between p-4 rounded-xl bg-background/50 w-full hover:bg-background/80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-base font-medium">Modifier le mot de passe</p>
                  <p className="text-sm text-muted-foreground">
                    Changer votre mot de passe (vérification par email)
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-primary/20">
          <CardHeader>
            <h3 className="text-2xl display-font">Actions rapides</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setShowFavorites(true)}
              className="w-full justify-start h-14 rounded-xl border-primary/30 hover:bg-primary/10 text-base"
            >
              <Heart className="w-5 h-5 mr-3 text-primary" />
              Mes recettes favorites
              {userStats && userStats.favorites_count > 0 && (
                <span className="ml-auto text-muted-foreground">({userStats.favorites_count})</span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full justify-start h-14 rounded-xl border-destructive/30 hover:bg-destructive/10 text-destructive text-base"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal Modifier le nom */}
      <Dialog open={showUsernameModal} onOpenChange={setShowUsernameModal}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl display-font text-primary">
              Modifier le nom
            </DialogTitle>
            <DialogDescription>Entrez votre nouveau nom d'affichage</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Nouveau nom"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="h-12"
            />
            {modalError && <p className="text-sm text-destructive">{modalError}</p>}
            {modalSuccess && <p className="text-sm text-green-500">{modalSuccess}</p>}
            <Button
              onClick={handleUpdateUsername}
              disabled={modalLoading}
              className="w-full h-12 bg-primary text-black hover:bg-primary/90"
            >
              {modalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Modifier le mot de passe */}
      <Dialog
        open={showPasswordModal}
        onOpenChange={(open) => {
          setShowPasswordModal(open);
          if (!open) resetPasswordModal();
        }}
      >
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl display-font text-primary">
              Modifier le mot de passe
            </DialogTitle>
            <DialogDescription>
              {passwordStep === "request"
                ? "Un code de vérification sera envoyé à votre email"
                : "Entrez le code reçu et votre nouveau mot de passe"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {passwordStep === "request" ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Email : <span className="text-foreground">{userStats?.email}</span>
                </p>
                <Button
                  onClick={handleRequestPasswordChange}
                  disabled={modalLoading}
                  className="w-full h-12 bg-primary text-black hover:bg-primary/90"
                >
                  {modalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer le code"}
                </Button>
              </>
            ) : (
              <>
                {devCode && (
                  <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                    <p className="text-sm text-amber-400">
                      Mode dev - Code : <span className="font-mono font-bold">{devCode}</span>
                    </p>
                  </div>
                )}
                <Input
                  placeholder="Code de vérification"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="h-12"
                  maxLength={6}
                />
                <Input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12"
                />
                <Input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12"
                />
                <Button
                  onClick={handleVerifyPasswordChange}
                  disabled={modalLoading}
                  className="w-full h-12 bg-primary text-black hover:bg-primary/90"
                >
                  {modalLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Modifier le mot de passe"
                  )}
                </Button>
              </>
            )}
            {modalError && <p className="text-sm text-destructive">{modalError}</p>}
            {modalSuccess && <p className="text-sm text-green-500">{modalSuccess}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
