import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Moon, Sun, Bell, Heart, Settings, LogOut, Crown } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ProfilePageProps {
  onLogout: () => void;
}

export function ProfilePage({ onLogout }: ProfilePageProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-5xl mb-2 display-font text-primary">Profil</h1>
          <p className="text-muted-foreground text-lg">
            Gérez vos préférences culinaires
          </p>
        </div>

        {/* Profile Header */}
        <Card className="bg-card border-primary/20">
          <CardContent className="pt-8">
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
                <h2 className="text-3xl mb-1 display-font">Chef Étoilé</h2>
                <p className="text-muted-foreground">chef@gourmet.fr</p>
              </div>
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-full border-primary/30 hover:bg-primary/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Modifier le profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border-primary/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2 display-font text-primary">12</div>
              <p className="text-muted-foreground">Recettes</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-primary/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2 display-font text-primary">24</div>
              <p className="text-muted-foreground">Favoris</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-primary/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2 display-font text-primary">8</div>
              <p className="text-muted-foreground">Créées</p>
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
                {theme === 'dark' ? (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-primary" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sun className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <Label htmlFor="theme-mode" className="text-base">Mode sombre</Label>
                  <p className="text-sm text-muted-foreground">
                    Basculer entre les thèmes clair et sombre
                  </p>
                </div>
              </div>
              <Switch
                id="theme-mode"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <Label htmlFor="notifications" className="text-base">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des suggestions de recettes
                  </p>
                </div>
              </div>
              <Switch id="notifications" />
            </div>
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
              className="w-full justify-start h-14 rounded-xl border-primary/30 hover:bg-primary/10 text-base"
            >
              <Heart className="w-5 h-5 mr-3 text-primary" />
              Mes recettes favorites
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start h-14 rounded-xl border-primary/30 hover:bg-primary/10 text-base"
            >
              <Settings className="w-5 h-5 mr-3 text-primary" />
              Préférences alimentaires
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
    </div>
  );
}
