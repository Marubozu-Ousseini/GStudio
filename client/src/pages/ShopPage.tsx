import { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ThemeToggle from '@/components/ThemeToggle';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { SlidersHorizontal, X } from 'lucide-react';
import { type Product } from '@shared/schema';

export default function ShopPage() {
  const [, params] = useRoute('/shop/:category');
  const category = params?.category || 'all';
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [sortBy, setSortBy] = useState('newest');

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { category: category === 'all' ? undefined : category }],
  });

  // Filter by price range
  const filteredProducts = (products || []).filter(product => {
    const price = product.salePrice || product.price;
    return price >= priceRange[0] && price <= priceRange[1];
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case 'price-high':
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const categoryTitles: Record<string, string> = {
    'all': 'Tous les Produits',
    'clothes': 'Vêtements',
    'perfumes': 'Parfums',
    'accessories': 'Accessoires'
  };
  
  const categoryTitle = categoryTitles[category] || 'Tous les Produits';

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
        <div className="bg-card border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-medium mb-4" data-testid="text-page-title">
              {categoryTitle}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <aside className={`${filtersOpen ? 'fixed inset-0 z-40 bg-background p-6 overflow-auto lg:relative lg:z-0 lg:p-0' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}>
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-medium">Filtres</h2>
                <Button size="icon" variant="ghost" onClick={() => setFiltersOpen(false)} data-testid="button-close-filters">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Gamme de Prix</Label>
                  <Slider
                    min={0}
                    max={150000}
                    step={5000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-2"
                    data-testid="slider-price-range"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{priceRange[0].toLocaleString()} XAF</span>
                    <span>{priceRange[1].toLocaleString()} XAF</span>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6 gap-4">
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                  data-testid="button-open-filters"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtres
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48" data-testid="select-sort">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Plus récents</SelectItem>
                    <SelectItem value="price-low">Prix: Croissant</SelectItem>
                    <SelectItem value="price-high">Prix: Décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Chargement des produits...</p>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucun produit trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {sortedProducts.map((product) => (
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
}
