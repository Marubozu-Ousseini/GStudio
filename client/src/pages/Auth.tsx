import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const [, setLocation] = useLocation();
  const { user, login, register, logout } = useAuth();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await login(loginEmail, loginPassword);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Luxe!",
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Échec de la connexion",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    try {
      await register(signupName, signupEmail, signupPassword);
      toast({
        title: "Inscription réussie",
        description: "Bienvenue sur Luxe!",
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Échec de l'inscription",
        variant: "destructive",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt!",
    });
  };

  // If user is logged in, show account info instead
  if (user) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md px-4">
            <div className="text-center mb-8">
              <h1 className="font-serif text-4xl font-medium mb-2">Mon Compte</h1>
              <p className="text-muted-foreground">Bienvenue, {user.username}!</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border">
                <div className="space-y-2">
                  <div>
                    <Label>Nom d'utilisateur</Label>
                    <p className="font-medium">{user.username}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  {user.isAdmin && (
                    <div>
                      <Badge className="mt-2">Administrateur</Badge>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="w-full"
                data-testid="button-logout"
              >
                Se Déconnecter
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-medium mb-2">Bienvenue</h1>
            <p className="text-muted-foreground">Connectez-vous à votre compte ou créez-en un nouveau</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" data-testid="tab-login">Connexion</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    data-testid="input-login-email"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    data-testid="input-login-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn} data-testid="button-login-submit">
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se Connecter"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Nom Complet</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    data-testid="input-signup-name"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    data-testid="input-signup-email"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    data-testid="input-signup-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSigningUp} data-testid="button-signup-submit">
                  {isSigningUp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    "Créer un Compte"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
}
