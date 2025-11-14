import { storage } from "./storage";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  try {
    // Check if products already exist
    const existingProducts = await storage.getAllProducts({ limit: 1 });
    if (existingProducts.length > 0) {
      console.log("✓ Database already seeded");
      return;
    }

    console.log("Seeding database with initial data...");

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await storage.createUser({
      username: "admin",
      email: "admin@luxe.com",
      password: hashedPassword,
      isAdmin: 1
    });

    // Create sample products
    const products = [
      {
        name: "Essence de Luxe",
        description: "Un parfum exquis qui combine des notes florales et boisées pour un parfum sophistiqué. Parfait pour toute occasion, ce parfum luxueux incarne élégance et raffinement.",
        price: 60000,
        salePrice: 44500,
        category: "perfumes",
        imageUrl: "/api/placeholder/perfume1.jpg",
        materials: "100% huiles de parfum premium, alcool dénaturé, eau",
        care: "Conserver dans un endroit frais et sec, à l'abri de la lumière directe du soleil."
      },
      {
        name: "Sac en Cuir Classique",
        description: "Sac à main en cuir véritable fait à la main avec une finition premium. Spacieux et élégant, parfait pour un usage quotidien.",
        price: 140000,
        salePrice: null,
        category: "accessories",
        imageUrl: "/api/placeholder/bag1.jpg",
        materials: "100% cuir véritable, doublure en tissu",
        care: "Nettoyer avec un chiffon doux et sec. Éviter l'exposition prolongée au soleil."
      },
      {
        name: "T-shirt Coton Premium",
        description: "T-shirt en coton biologique ultra-doux avec une coupe moderne. Confort exceptionnel et style intemporel.",
        price: 22500,
        salePrice: null,
        category: "clothes",
        imageUrl: "/api/placeholder/tshirt1.jpg",
        materials: "100% coton biologique",
        care: "Lavage en machine à 30°C. Ne pas blanchir."
      },
      {
        name: "Foulard en Soie",
        description: "Foulard en soie pure avec des motifs élégants. Accessoire polyvalent qui ajoute une touche de sophistication.",
        price: 32500,
        salePrice: 24500,
        category: "accessories",
        imageUrl: "/api/placeholder/scarf1.jpg",
        materials: "100% soie naturelle",
        care: "Nettoyage à sec uniquement."
      },
      {
        name: "Lunettes de Soleil Design",
        description: "Lunettes de soleil de designer avec protection UV400. Monture métallique durable et verres polarisés.",
        price: 97500,
        salePrice: null,
        category: "accessories",
        imageUrl: "/api/placeholder/sunglasses1.jpg",
        materials: "Monture en métal, verres polarisés",
        care: "Nettoyer avec un chiffon en microfibre."
      },
      {
        name: "Parfum Floral",
        description: "Fragrance florale légère avec des notes de jasmin et de rose. Parfait pour la journée.",
        price: 47500,
        salePrice: null,
        category: "perfumes",
        imageUrl: "/api/placeholder/perfume2.jpg",
        materials: "Huiles essentielles naturelles, alcool",
        care: "Conserver à température ambiante."
      },
      {
        name: "Chemise Décontractée",
        description: "Chemise en lin respirante avec une coupe décontractée. Idéale pour les occasions casual chic.",
        price: 39000,
        salePrice: null,
        category: "clothes",
        imageUrl: "/api/placeholder/shirt1.jpg",
        materials: "55% lin, 45% coton",
        care: "Lavage en machine à 40°C. Repasser à température moyenne."
      },
      {
        name: "Senteur de Minuit",
        description: "Parfum intense avec des notes boisées et épicées. Pour les soirées spéciales.",
        price: 67500,
        salePrice: null,
        category: "perfumes",
        imageUrl: "/api/placeholder/perfume3.jpg",
        materials: "Concentré de parfum, base alcoolique",
        care: "Tenir à l'écart de la chaleur et de la lumière."
      }
    ];

    for (const product of products) {
      await storage.createProduct(product);
    }

    console.log("✓ Database seeded successfully with", products.length, "products");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
