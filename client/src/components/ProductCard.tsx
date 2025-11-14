import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, ShoppingCart } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { celebrateAddToCart } from '@/lib/confetti';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  category: string;
}

export default function ProductCard({ id, name, price, salePrice, image, category }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Veuillez vous connecter pour ajouter au panier');
      }
      return await apiRequest('/api/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId: id,
          quantity: 1
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      celebrateAddToCart();
      toast({
        title: "Ajouté au panier",
        description: `${name} ajouté à votre panier`,
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

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Retiré des favoris" : "Ajouté aux favoris",
      description: name,
    });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCartMutation.mutate();
  };

  return (
    <Link href={`/product/${id}`} data-testid={`link-product-${id}`}>
      <div className="group relative overflow-visible hover-lift" data-testid={`card-product-${id}`}>
        <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-md bg-muted">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          
          <Button
            size="icon"
            variant="ghost"
            className={`absolute top-2 right-2 bg-white/90 hover:bg-white ${isWishlisted ? 'text-destructive' : ''}`}
            onClick={handleWishlistToggle}
            data-testid={`button-wishlist-${id}`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>

          <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity p-4">
            <Button
              className="w-full backdrop-blur-sm bg-white/90 hover:bg-white text-foreground"
              onClick={handleQuickAdd}
              disabled={addToCartMutation.isPending}
              data-testid={`button-quick-add-${id}`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground" data-testid={`text-category-${id}`}>
            {category}
          </p>
          <h3 className="font-serif text-lg font-medium line-clamp-1" data-testid={`text-name-${id}`}>
            {name}
          </h3>
          <div className="flex items-center gap-2">
            {salePrice ? (
              <>
                <span className="text-lg font-medium text-destructive animate-sale-glow" data-testid={`text-sale-price-${id}`}>
                  {salePrice.toLocaleString()} XAF
                </span>
                <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${id}`}>
                  {price.toLocaleString()} XAF
                </span>
              </>
            ) : (
              <span className="text-lg font-medium" data-testid={`text-price-${id}`}>
                {price.toLocaleString()} XAF
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
