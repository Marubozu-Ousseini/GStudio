import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryShowcase from '@/components/CategoryShowcase';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';
import PageTransition from '@/components/PageTransition';
import { type Product } from '@shared/schema';

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Get first 6 products for featured section
  const featuredProducts = products?.slice(0, 6) || [];

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
        <Hero />
        <CategoryShowcase />
        
        <section className="py-16 sm:py-24 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-medium mb-4">Nouveautés</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Découvrez les derniers ajouts à notre collection
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Chargement des produits...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard 
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    salePrice={product.salePrice || undefined}
                    image={product.imageUrl}
                    category={getCategoryName(product.category)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-medium mb-6">Livraison Gratuite dès 50 000 XAF</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Profitez de la livraison gratuite sur toutes les commandes de plus de 50 000 XAF. Achetez maintenant et sublimez votre style avec notre mode premium, parfums et accessoires.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
}
