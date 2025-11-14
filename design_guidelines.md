# Design Guidelines: Fashion & Fragrance E-Commerce Platform

## Design Approach

**Reference-Based Approach**: Drawing inspiration from luxury e-commerce leaders (Net-a-Porter, Aesop, Everlane) combined with modern minimalism. This application requires sophisticated visual presentation where product imagery drives conversion.

## Core Design Principles

1. **Editorial Elegance**: Magazine-style layouts that elevate products as hero content
2. **Breathing Room**: Generous whitespace to create premium feel
3. **Image-First**: Large, high-quality product photography as primary design element
4. **Restrained Sophistication**: Minimal UI chrome that doesn't compete with products

## Typography System

**Primary Font**: Inter or Manrope (Google Fonts) - clean, modern sans-serif
**Secondary Font**: Crimson Pro or Lora - for editorial headings and product names

**Hierarchy**:
- Hero Headlines: text-5xl to text-7xl, font-light or font-normal
- Section Headings: text-3xl to text-4xl, font-medium
- Product Names: text-xl, font-medium with secondary font
- Body Text: text-base, leading-relaxed
- Labels/Metadata: text-sm, uppercase tracking-wide

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24 (desktop), py-12 (mobile)
- Grid gaps: gap-6 to gap-8

**Container Strategy**:
- Full-width sections with inner max-w-7xl
- Product grids: max-w-6xl
- Text content: max-w-prose for descriptions

## Component Library

### Navigation
- Fixed header with transparent-to-solid transition on scroll
- Horizontal navigation with category dropdown menus
- Right-aligned: Search icon, Account icon, Cart icon with item count badge
- Mobile: Hamburger menu with slide-in drawer

### Product Grid (Catalog)
- Desktop: 3-column grid (lg:grid-cols-3)
- Tablet: 2-column grid (md:grid-cols-2)
- Mobile: Single column
- Product cards: Minimal borders, image dominates (aspect-square or aspect-[3/4])
- Hover state: Subtle scale transform (scale-105) on product image only
- Card content: Product image, name, price, "Quick View" button on hover

### Product Detail Page
- Two-column layout: Image gallery (60%) + Product info (40%)
- Image gallery: Main large image with thumbnail strip below
- Sticky "Add to Cart" section on scroll
- Accordion-style collapsible sections for: Description, Materials, Care Instructions, Shipping

### Shopping Cart
- Slide-out drawer from right side (overlay + drawer pattern)
- Line items with thumbnail, name, quantity selector, remove button
- Fixed footer with subtotal and "Checkout" CTA

### Checkout Flow
- Clean, stepped process (Shipping → Payment → Review)
- Progress indicator at top
- Single-column form layout (max-w-2xl centered)
- Order summary sticky sidebar on desktop

### Admin Panel
- Left sidebar navigation (fixed, collapsed on mobile)
- Data tables with sort/filter controls
- Product form: Two-column layout with image upload dropzone
- Dashboard cards for key metrics (grid-cols-1 md:grid-cols-3)

## Images Strategy

**Hero Section**: Full-width lifestyle image (h-[70vh]) featuring curated products in lifestyle context. Image should showcase brand aesthetic - elegant, aspirational. Overlay with centered heading and CTA button with backdrop-blur background.

**Category Pages**: Banner images for each category (Clothes/Perfumes/Accessories) - aspect-[21/9] ratio, with category name overlaid.

**Product Images**: Professional product photography on clean backgrounds (white/neutral). Multiple angles, detail shots. Minimum 800x800px for quality.

**About/Brand Story**: Editorial-style imagery showing craftsmanship, ingredients, or brand story - interspersed with text content.

## Page-Specific Layouts

### Homepage
1. **Hero**: Full-width image with centered CTA (backdrop-blur-sm on button)
2. **Featured Categories**: 3-column grid with large category images and labels
3. **New Arrivals**: 4-column product grid (scrollable on mobile)
4. **Editorial Section**: Split layout - large image (60%) + text content (40%)
5. **Newsletter Signup**: Centered, minimal form with backdrop image
6. **Footer**: 4-column layout (Company, Shop, Support, Follow) with social links

### Category Pages
- Hero banner specific to category
- Filter sidebar (collapsible on mobile) with: Price range, Brand, Size, Color
- Product grid with sort dropdown (Newest, Price: Low-High, Price: High-Low)
- "Load More" button for pagination

### User Account
- Sidebar navigation: Profile, Orders, Addresses, Wishlist
- Order history: Card-based layout with order summary and "View Details" expansion

## Accessibility & Form Standards

- All form inputs: Consistent height (h-12), rounded-md, border styling
- Focus states: ring-2 ring-offset-2 for keyboard navigation
- Labels: Always visible, text-sm font-medium mb-2
- Error states: Red border + error message below input
- Success states: Green checkmark icon

## Animation Philosophy

**Minimal & Purposeful Only**:
- Page transitions: Simple fade-in
- Product hover: scale-105 transform (duration-300)
- Cart drawer: slide-in-right transition
- No parallax, no scroll-triggered animations
- Loading states: Simple spinner, no elaborate animations

## Special Considerations

**Product Cards Must Include**:
- High-quality product image
- Product name (truncate with ellipsis if needed)
- Price (with sale price if applicable)
- Quick view button (visible on hover, desktop only)
- Wishlist heart icon (top-right corner)

**Mobile-First Refinements**:
- Touch-friendly tap targets (min-h-12)
- Sticky "Add to Cart" bar on product pages
- Simplified navigation with full-screen menu
- Stack all multi-column layouts to single column

This design creates a premium shopping experience that highlights products while maintaining clean, intuitive navigation and conversion-optimized layouts throughout the customer journey.