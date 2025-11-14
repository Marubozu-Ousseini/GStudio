import { Link } from 'wouter';
import clothesImage from '@assets/generated_images/Clothing_product_photo_676944d5.png';
import perfumeImage from '@assets/generated_images/Perfume_product_photo_71e2fc17.png';
import accessoriesImage from '@assets/generated_images/Handbag_accessory_photo_3aae9f9d.png';

const categories = [
  { name: 'Vêtements', image: clothesImage, href: '/shop/clothes' },
  { name: 'Parfums', image: perfumeImage, href: '/shop/perfumes' },
  { name: 'Accessoires', image: accessoriesImage, href: '/shop/accessories' },
];

export default function CategoryShowcase() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-medium mb-4">Acheter par Catégorie</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explorez nos collections de mode premium, parfums et accessoires
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link key={category.name} href={category.href} data-testid={`link-category-${category.name.toLowerCase()}`}>
              <div className="group relative aspect-[21/9] md:aspect-square overflow-hidden rounded-md hover-elevate active-elevate-2">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end p-6">
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white" data-testid={`text-category-${category.name.toLowerCase()}`}>
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
