import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { generateToken, authMiddleware, adminMiddleware, type AuthRequest } from "./auth";
import { insertUserSchema, insertProductSchema, insertCartItemSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { upload, uploadBufferToGCS } from "./upload";
import express from "express";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard'
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static('server/uploads'));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ======== Authentication Routes ========
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Cet email est déjà utilisé" });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Ce nom d'utilisateur est déjà pris" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      // Generate token
      const token = generateToken(user);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        },
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Register error:", error);
      res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        },
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Erreur lors de la connexion" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
    }
  });

  // ======== Product Routes ========
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, limit, offset } = req.query;
      
      const products = await storage.getAllProducts({
        category: category as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });

      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des produits" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Produit non trouvé" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du produit" });
    }
  });

  app.post("/api/products", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Create product error:", error);
      res.status(500).json({ error: "Erreur lors de la création du produit" });
    }
  });

  app.patch("/api/products/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Produit non trouvé" });
      }
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour du produit" });
    }
  });

  app.delete("/api/products/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Produit non trouvé" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ error: "Erreur lors de la suppression du produit" });
    }
  });

  // Image upload endpoint (local disk or GCS depending on env)
  app.post("/api/upload", authMiddleware, adminMiddleware, upload.single('image'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
      }

      let imageUrl: string;
      if (process.env.GCS_BUCKET && req.file.buffer) {
        imageUrl = await uploadBufferToGCS(req.file);
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      res.json({ imageUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Erreur lors du téléchargement de l'image" });
    }
  });

  // ======== Cart Routes ========
  app.get("/api/cart", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const items = await storage.getCartItems(req.user!.id);
      res.json(items);
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du panier" });
    }
  });

  app.post("/api/cart", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const data = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const item = await storage.addToCart(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Add to cart error:", error);
      res.status(500).json({ error: "Erreur lors de l'ajout au panier" });
    }
  });

  app.patch("/api/cart/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { quantity } = req.body;
      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Quantité invalide" });
      }

      const item = await storage.updateCartItemQuantity(req.params.id, quantity);
      if (!item) {
        return res.status(404).json({ error: "Article non trouvé" });
      }
      res.json(item);
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour du panier" });
    }
  });

  app.delete("/api/cart/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const success = await storage.removeFromCart(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Article non trouvé" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ error: "Erreur lors de la suppression du panier" });
    }
  });

  app.delete("/api/cart", authMiddleware, async (req: AuthRequest, res) => {
    try {
      await storage.clearCart(req.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ error: "Erreur lors du vidage du panier" });
    }
  });

  // ======== Order Routes ========
  app.post("/api/orders", authMiddleware, async (req: AuthRequest, res) => {
    try {
      // Get cart items
      const cartItems = await storage.getCartItems(req.user!.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Le panier est vide" });
      }

      // Calculate total
      const subtotal = cartItems.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price;
        return sum + (price * item.quantity);
      }, 0);

      const shippingCost = subtotal >= 50000 ? 0 : 7500;
      const totalAmount = subtotal + shippingCost;

      // Validate shipping data
      const orderData = insertOrderSchema.parse({
        userId: req.user!.id,
        totalAmount,
        shippingCost,
        ...req.body
      });

      // Create order items
      const orderItemsData = cartItems.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        productPrice: item.product.salePrice || item.product.price,
        quantity: item.quantity
      }));

      // Create order
      const order = await storage.createOrder(orderData, orderItemsData);

      // Clear cart
      await storage.clearCart(req.user!.id);

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Create order error:", error);
      res.status(500).json({ error: "Erreur lors de la création de la commande" });
    }
  });

  app.get("/api/orders", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const orders = await storage.getUserOrders(req.user!.id);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des commandes" });
    }
  });

  app.get("/api/orders/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Commande non trouvée" });
      }

      // Verify ownership
      if (order.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ error: "Accès interdit" });
      }

      res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de la commande" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
