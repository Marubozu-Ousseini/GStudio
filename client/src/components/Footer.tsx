import { Link } from 'wouter';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup submitted');
  };

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h3 className="font-serif text-xl font-medium mb-4">Luxe</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Mode premium, parfums et accessoires pour les personnes exigeantes.
            </p>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" data-testid="button-facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="button-instagram">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="button-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Boutique</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop/clothes" data-testid="link-footer-clothes">
                  <span className="text-muted-foreground hover:text-foreground transition-colors">Vêtements</span>
                </Link>
              </li>
              <li>
                <Link href="/shop/perfumes" data-testid="link-footer-perfumes">
                  <span className="text-muted-foreground hover:text-foreground transition-colors">Parfums</span>
                </Link>
              </li>
              <li>
                <Link href="/shop/accessories" data-testid="link-footer-accessories">
                  <span className="text-muted-foreground hover:text-foreground transition-colors">Accessoires</span>
                </Link>
              </li>
              <li>
                <Link href="/collections" data-testid="link-footer-collections">
                  <span className="text-muted-foreground hover:text-foreground transition-colors">Collections</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" data-testid="link-footer-contact">
                  <span className="text-muted-foreground hover:text-foreground transition-colors">Nous Contacter</span>
                </Link>
              </li>
              <li>
                <Link href="/shipping" data-testid="link-footer-shipping">
                  <span className="text-muted-foreground hover:text-foreground transition-colors">Livraison</span>
                </Link>
              </li>
              <li>
                <Link href="/returns" data-testid="link-footer-returns">
                  <span className="text-muted-foreground hover:text-foreground transition-colors">Retours</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" data-testid="link-footer-faq">
                  <span className="text-muted-foreground hover:text-foreground transition-colors">FAQ</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Abonnez-vous pour recevoir des mises à jour et des offres exclusives.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Votre email"
                required
                data-testid="input-newsletter-email"
              />
              <Button type="submit" className="w-full" data-testid="button-newsletter-submit">
                <Mail className="h-4 w-4 mr-2" />
                S'abonner
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Luxe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
