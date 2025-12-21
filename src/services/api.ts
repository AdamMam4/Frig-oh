const API_BASE_URL = "http://localhost:8000";

export interface GeneratedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: number;
  servings: number;
  id?: string;
  _id?: string;
  user_id?: string;
  is_ai_generated?: boolean;
  created_at?: string;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem("access_token");
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async generateRecipe(ingredients: string[]): Promise<GeneratedRecipe> {
    console.log("🌐 API: Génération de recette");
    console.log("🌐 URL:", `${API_BASE_URL}/recipes/generate`);
    console.log("🌐 Ingrédients envoyés:", ingredients);

    const response = await fetch(`${API_BASE_URL}/recipes/generate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(ingredients),
    });

    console.log("🌐 Status de la réponse:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.log("🌐 Erreur 401: Non authentifié");
        throw new Error("Vous devez être connecté pour générer une recette avec l'IA");
      }
      const error = await response.json();
      console.log("🌐 Erreur API:", error);
      throw new Error(error.detail || "Erreur lors de la génération de la recette");
    }

    const data = await response.json();
    console.log("🌐 Recette générée reçue:", data);
    return data;
  }

  async getUserRecipes(): Promise<GeneratedRecipe[]> {
    console.log("🌐 API: Récupération des recettes utilisateur");
    console.log("🌐 URL:", `${API_BASE_URL}/recipes/`);

    const response = await fetch(`${API_BASE_URL}/recipes/`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    console.log("🌐 Status de la réponse:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.log("🌐 Erreur 401: Non authentifié");
        throw new Error("Vous devez être connecté pour voir vos recettes");
      }
      const error = await response.json();
      console.log("🌐 Erreur API:", error);
      throw new Error(error.detail || "Erreur lors du chargement des recettes");
    }

    const data = await response.json();
    console.log("🌐 Recettes reçues:", data);
    console.log("🌐 Nombre de recettes:", data.length);
    return data;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; token_type: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erreur de connexion");
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    return data;
  }

  async register(email: string, username: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors de l'inscription");
    }

    return response.json();
  }

  logout(): void {
    localStorage.removeItem("access_token");
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiService = new ApiService();
