import { useState } from 'react';
import { Link } from 'wouter';
import { ShoppingCart, User, Search, Menu, X, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AnimatedCounter from '@/components/AnimatedCounter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CartItem = {
  id: string;
  quantity: number;
};

export default function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Fetch cart items if user is logged in
  const { data: cartItems } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });

  const cartItemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <Link href="/" data-testid="link-home">
              <h1 className="font-serif text-2xl font-medium tracking-tight">Luxe</h1>
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/shop/clothes" data-testid="link-clothes">
                <span className="text-sm font-medium hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-colors">
                  Vêtements
                </span>
              </Link>
              <Link href="/shop/perfumes" data-testid="link-perfumes">
                <span className="text-sm font-medium hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-colors">
                  Parfums
                </span>
              </Link>
              <Link href="/shop/accessories" data-testid="link-accessories">
                <span className="text-sm font-medium hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-colors">
                  Accessoires
                </span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="hidden sm:flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Rechercher des produits..."
                  className="w-64"
                  autoFocus
                  data-testid="input-search"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSearchOpen(false)}
                  data-testid="button-close-search"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSearchOpen(true)}
                data-testid="button-search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            <Button size="icon" variant="ghost" data-testid="button-wishlist">
              <Heart className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" data-testid="button-account-menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" data-testid="link-account-dropdown">
                      Mon Compte
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" data-testid="link-admin-dropdown">
                        Administration
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout} data-testid="button-logout-dropdown">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/account" data-testid="link-account">
                <Button size="icon" variant="ghost">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link href="/cart" data-testid="link-cart">
              <Button size="icon" variant="ghost" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                    data-testid="badge-cart-count"
                  >
                    <AnimatedCounter value={cartItemCount} />
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 space-y-2" data-testid="nav-mobile">
            <Link href="/shop/clothes" data-testid="link-mobile-clothes">
              <div className="block px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2">
                Vêtements
              </div>
            </Link>
            <Link href="/shop/perfumes" data-testid="link-mobile-perfumes">
              <div className="block px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2">
                Parfums
              </div>
            </Link>
            <Link href="/shop/accessories" data-testid="link-mobile-accessories">
              <div className="block px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2">
                Accessoires
              </div>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
