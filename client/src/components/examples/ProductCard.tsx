import ProductCard from '../ProductCard';
import perfumeImage from '@assets/generated_images/Perfume_product_photo_71e2fc17.png';

export default function ProductCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <ProductCard
        id="1"
        name="Essence de Luxe"
        price={120}
        salePrice={89}
        image={perfumeImage}
        category="Perfumes"
      />
    </div>
  );
}
