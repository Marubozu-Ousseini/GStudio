import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { celebrateOrderSuccess } from '@/lib/confetti';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type CartItem, type Product } from '@shared/schema';

type CartItemWithProduct = CartItem & { product: Product };

export default function Cart() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return await apiRequest(`/api/cart/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité",
        variant: "destructive",
      });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/cart/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Article retiré",
        description: "L'article a été retiré de votre panier",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de retirer l'article",
        variant: "destructive",
      });
    }
  });

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  const removeItem = (id: string) => {
    removeItemMutation.mutate(id);
  };

  // If user is not logged in, redirect to account page
  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h1 className="font-serif text-3xl font-medium mb-4">Connexion Requise</h1>
            <p className="text-muted-foreground mb-6">
              Veuillez vous connecter pour voir votre panier
            </p>
            <Link href="/account">
              <Button>Se Connecter</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
      </PageTransition>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);
  const shipping = subtotal >= 50000 ? 0 : 7500;
  const total = subtotal + shipping;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-medium mb-8" data-testid="text-page-title">
            Panier d'Achat
          </h1>

          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Chargement de votre panier...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-6">Votre panier est vide</p>
              <Link href="/shop/all" data-testid="link-continue-shopping">
                <Button>Continuer vos Achats</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const price = item.product.salePrice || item.product.price;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-card rounded-md border"
                      data-testid={`cart-item-${item.id}`}
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-md bg-muted"
                      />
                      <div className="flex-1">
                        <h3 className="font-serif text-lg font-medium mb-2" data-testid={`text-item-name-${item.id}`}>
                          {item.product.name}
                        </h3>
                        <p className="text-muted-foreground mb-3" data-testid={`text-item-price-${item.id}`}>
                          {price.toLocaleString()} XAF
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm" data-testid={`text-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updateQuantityMutation.isPending}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          disabled={removeItemMutation.isPending}
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <p className="font-medium" data-testid={`text-item-total-${item.id}`}>
                          {(price * item.quantity).toLocaleString()} XAF
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-card rounded-md border p-6 sticky top-24">
                  <h2 className="font-serif text-2xl font-medium mb-6">Résumé de Commande</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span data-testid="text-subtotal">{subtotal.toLocaleString()} XAF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span data-testid="text-shipping">
                        {shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString()} XAF`}
                      </span>
                    </div>
                    {subtotal < 50000 && (
                      <p className="text-xs text-muted-foreground">
                        Ajoutez {(50000 - subtotal).toLocaleString()} XAF pour la livraison gratuite
                      </p>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-medium">
                        <span>Total</span>
                        <span data-testid="text-total">{total.toLocaleString()} XAF</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      celebrateOrderSuccess();
                      toast({
                        title: "Commande confirmée !",
                        description: "Votre commande a été enregistrée avec succès. Le paiement sera bientôt disponible.",
                      });
                    }}
                    data-testid="link-checkout"
                  >
                    Procéder au Paiement
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
}
