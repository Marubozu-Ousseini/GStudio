import { useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { celebrateAddToCart } from '@/lib/confetti';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Heart, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Product } from '@shared/schema';

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const productId = params?.id || '';
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Veuillez vous connecter pour ajouter au panier');
      }
      return await apiRequest('/api/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantity
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      celebrateAddToCart();
      toast({
        title: "Ajouté au panier",
        description: `${quantity} × ${product?.name} ajouté à votre panier`,
      });
    },
    onError: (error: any) => {
      if (error.message.includes('connecter')) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour ajouter des articles au panier",
          variant: "destructive",
        });
        setLocation('/account');
      } else {
        toast({
          title: "Erreur",
          description: error.message || "Impossible d'ajouter au panier",
          variant: "destructive",
        });
      }
    }
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Retiré des favoris" : "Ajouté aux favoris",
      description: product?.name,
    });
  };

  if (isLoading) {
    return (
      <PageTransition disableTransition>
        <div className="min-h-screen flex flex-col">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement...</p>
        </main>
        <Footer />
      </div>
      </PageTransition>
    );
  }

  if (!product) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium mb-4">Produit non trouvé</h1>
            <Link href="/shop/all">
              <Button>Retour à la Boutique</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
      </PageTransition>
    );
  }

  const getCategoryName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'perfumes': 'Parfums',
      'accessories': 'Accessoires',
      'clothes': 'Vêtements'
    };
    return categoryNames[category] || category;
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <nav className="mb-8">
            <Link href="/shop/all" data-testid="link-back-to-shop">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Retour à la Boutique
              </span>
            </Link>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square rounded-md overflow-hidden bg-muted">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
                data-testid="img-product"
              />
            </div>

            <div className="flex flex-col">
              <div className="mb-6">
                <Badge className="mb-3" data-testid="badge-category">
                  {getCategoryName(product.category)}
                </Badge>
                <h1 className="font-serif text-4xl sm:text-5xl font-medium mb-4" data-testid="text-product-name">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mb-6">
                  {product.salePrice ? (
                    <>
                      <span className="text-3xl font-medium text-destructive animate-sale-glow" data-testid="text-sale-price">
                        {product.salePrice.toLocaleString()} XAF
                      </span>
                      <span className="text-xl text-muted-foreground line-through" data-testid="text-original-price">
                        {product.price.toLocaleString()} XAF
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-medium" data-testid="text-price">
                      {product.price.toLocaleString()} XAF
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                  {product.description}
                </p>
              </div>

              <div className="mb-6">
                <Label className="mb-3 block font-medium">Quantité</Label>
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-decrease-quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                    data-testid="button-increase-quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 mb-8">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                  data-testid="button-add-to-cart"
                >
                  {addToCartMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Ajouter au Panier
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className={isWishlisted ? 'text-destructive' : ''}
                  data-testid="button-wishlist"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <Accordion type="single" collapsible className="border-t">
                <AccordionItem value="description">
                  <AccordionTrigger data-testid="accordion-description">Description</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="materials">
                  <AccordionTrigger data-testid="accordion-materials">Matériaux</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">{product.materials}</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="care">
                  <AccordionTrigger data-testid="accordion-care">Instructions d'Entretien</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">{product.care}</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                  <AccordionTrigger data-testid="accordion-shipping">Livraison</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">
                      Livraison gratuite pour les commandes de plus de 50 000 XAF. Livraison express disponible lors du paiement.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
}
