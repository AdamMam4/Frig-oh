import { useState } from 'react';
import { Home, Package, BookOpen, User } from 'lucide-react';
import { ThemeProvider } from './components/ThemeProvider';
import { HomePage } from './components/HomePage';
import { IngredientsPage } from './components/IngredientsPage';
import { RecipesPage } from './components/RecipesPage';
import { ProfilePage } from './components/ProfilePage';
import { LoginPage } from './components/LoginPage';
import { apiService } from "./services/api";
import IntroVideo from './components/IntroVideo';


type Page = "home" | "ingredients" | "recipes" | "profile";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // utilise sessionStorage : l'intro rejoue à chaque nouvelle session navigateur
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('introPlayed'));

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const isAuthenticated = apiService.isAuthenticated();
    setIsLoggedIn(isAuthenticated);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    apiService.logout();
    setIsLoggedIn(false);
    setCurrentPage("home"); // Réinitialiser la page à l'accueil
  };

  const handleIntroComplete = () => {
    sessionStorage.setItem('introPlayed', 'true');
    setShowIntro(false);
  };

  // Si l'intro doit être affichée
  if (showIntro) {
    return <IntroVideo onIntroComplete={handleIntroComplete} />;
  }

  // Si non connecté, afficher la page de login
  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage ingredients={ingredients} setIngredients={setIngredients} />;
      case "ingredients":
        return (
          <IngredientsPage
            ingredients={ingredients}
            setIngredients={setIngredients}
            onNavigate={(page) => setCurrentPage(page as Page)}
          />
        );
      case "recipes":
        return <RecipesPage />;
      case "profile":
        return <ProfilePage onLogout={handleLogout} />;
      default:
        return <HomePage ingredients={ingredients} setIngredients={setIngredients} />;
    }
  };

  const navItems = [
    { id: "home" as Page, icon: Home, label: "Accueil" },
    { id: "ingredients" as Page, icon: Package, label: "Ingrédients" },
    { id: "recipes" as Page, icon: BookOpen, label: "Recettes" },
    { id: "profile" as Page, icon: User, label: "Profil" },
  ];

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* Main Content */}
        {renderPage()}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-primary/20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-around h-20">
              {navItems.map(({ id, icon: Icon, label }) => {
                const isActive = currentPage === id;
                return (
                  <button
                    key={id}
                    onClick={() => setCurrentPage(id)}
                    className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all ${
                      isActive
                        ? "text-primary scale-105"
                        : "text-muted-foreground hover:text-primary/70"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
                    <span className={`text-xs ${isActive ? "font-semibold" : ""}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </ThemeProvider>
  );
}

export default App;
