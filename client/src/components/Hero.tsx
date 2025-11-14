import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import heroImage from '@assets/generated_images/Fashion_hero_banner_image_56fb30f7.png';

export default function Hero() {
  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>
      
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6">
          Collection Printemps 2024
        </h2>
        <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
          Découvrez notre sélection de mode premium, parfums et accessoires
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/shop/all" data-testid="link-shop-now">
            <Button size="lg" className="backdrop-blur-sm bg-white/90 text-foreground hover:bg-white">
              Acheter Maintenant
            </Button>
          </Link>
          <Link href="/collections" data-testid="link-explore">
            <Button size="lg" variant="outline" className="backdrop-blur-md bg-white/10 border-white/30 text-white hover:bg-white/20">
              Explorer les Collections
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
