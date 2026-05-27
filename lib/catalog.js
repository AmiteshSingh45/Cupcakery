const imagePool = {
  Cupcakes: ["/hpcakefinal.jpg", "/hp_img2.jpg", "/hp_img3.jpg"],
  Cakes: ["/birthday_cake.jpg", "/hpcakeproduct.jpeg", "/cake2.jpg", "/cake.jpg"],
  Brownies: ["/hpbrowniesproduct.jpg", "/brownie_best.jpg", "/Yummylicious Brownie Tub.jpg"],
  Cookies: ["/hpcookiesproduct1.jpg", "/chocodipcookiesbest.jpg"],
  Pastries: ["/hp_img4.jpg", "/trufflebest.jpg"],
  Macarons: ["/sweets.png", "/hamper.png"],
  Cheesecakes: ["/cake-8233676_640.jpg", "/cake.png"],
  "Gift Boxes": ["/hamper.png", "/sweets.png"],
};

export const catalogCategories = [
  { _id: "cat-cupcakes", name: "Cupcakes", slug: "cupcakes", image: "/hp_img2.jpg", count: 12 },
  { _id: "cat-cakes", name: "Cakes", slug: "cakes", image: "/birthday_cake.jpg", count: 12 },
  { _id: "cat-brownies", name: "Brownies", slug: "brownies", image: "/hpbrowniesproduct.jpg", count: 9 },
  { _id: "cat-cookies", name: "Cookies", slug: "cookies", image: "/hpcookiesproduct1.jpg", count: 9 },
  { _id: "cat-pastries", name: "Pastries", slug: "pastries", image: "/hp_img4.jpg", count: 8 },
  { _id: "cat-macarons", name: "Macarons", slug: "macarons", image: "/sweets.png", count: 8 },
  { _id: "cat-cheesecakes", name: "Cheesecakes", slug: "cheesecakes", image: "/cake.png", count: 6 },
  { _id: "cat-gift-boxes", name: "Gift Boxes", slug: "gift-boxes", image: "/hamper.png", count: 8 },
];

const productBlueprints = [
  ["Cupcakes", ["Belgian Chocolate Cloud Cupcake", "Vanilla Bean Confetti Cupcake", "Rose Pistachio Cupcake", "Salted Caramel Crunch Cupcake", "Strawberry Shortcake Cupcake", "Red Velvet Cream Cheese Cupcake", "Nutella Truffle Cupcake", "Lemon Blueberry Cupcake", "Mocha Fudge Cupcake", "Rasmalai Royale Cupcake", "Biscoff Buttercream Cupcake", "Dark Cherry Ganache Cupcake"]],
  ["Cakes", ["Signature Chocolate Fudge Cake", "Fresh Strawberry Cream Cake", "Lotus Biscoff Celebration Cake", "Classic Black Forest Cake", "Mango Saffron Mousse Cake", "Dutch Truffle Layer Cake", "Rasmalai Pistachio Cake", "Blueberry Cheesecake Gateau", "Hazelnut Praline Cake", "Rose Gold Birthday Cake", "Cookies and Cream Cake", "Caramel Almond Opera Cake"]],
  ["Brownies", ["Classic Walnut Fudge Brownie", "Triple Chocolate Brownie Tub", "Biscoff Blondie Squares", "Sea Salt Caramel Brownie", "Nutella Swirl Brownie", "Rocky Road Brownie Box", "Espresso Ganache Brownie", "Raspberry Dark Chocolate Brownie", "Celebration Brownie Slab"]],
  ["Cookies", ["Choco-Dip Butter Cookies", "Brown Butter Chocolate Chunk Cookies", "Red Velvet Cream Cookies", "Double Cocoa Crinkle Cookies", "Pistachio Rose Shortbread", "Oatmeal Cranberry Cookies", "Biscoff Stuffed Cookies", "Nutella Lava Cookies", "Vanilla Sprinkle Cookies"]],
  ["Pastries", ["Chocolate Truffle Pastry", "Mille-Feuille Vanilla Pastry", "Tiramisu Cream Cup", "Strawberry Choux Pastry", "Pineapple Fresh Cream Pastry", "Hazelnut Eclair", "Mocha Almond Pastry", "Blueberry Cream Pastry"]],
  ["Macarons", ["Assorted French Macaron Box", "Rose Lychee Macarons", "Chocolate Hazelnut Macarons", "Salted Caramel Macarons", "Pistachio Gold Macarons", "Raspberry Vanilla Macarons", "Coffee Ganache Macarons", "Mango Passion Macarons"]],
  ["Cheesecakes", ["New York Vanilla Cheesecake", "Blueberry Swirl Cheesecake", "Biscoff Mini Cheesecake", "Mango No-Bake Cheesecake", "Chocolate Marble Cheesecake", "Strawberry Jar Cheesecake"]],
  ["Gift Boxes", ["Celebration Dessert Hamper", "Premium Brownie Gift Box", "Cupcake Party Box", "Festive Mithai Dessert Box", "Cookie and Macaron Duo Box", "Birthday Bestseller Combo", "Corporate Dessert Hamper", "Mini Indulgence Sampler"]],
];

const categoryByName = Object.fromEntries(catalogCategories.map((cat) => [cat.name, cat]));
const tags = ["Bestseller", "Fresh Today", "Limited Batch", "Gift Ready", "New"];
const notes = {
  Cupcakes: "A soft, eggless cupcake finished with silky buttercream and bakery-made toppings.",
  Cakes: "A celebration-ready eggless cake layered with premium creams, fillings, and rich finishes.",
  Brownies: "Dense, fudgy, slow-baked brownies made with couverture-style chocolate notes.",
  Cookies: "Golden, buttery cookies with crisp edges, soft centers, and generous inclusions.",
  Pastries: "Single-serve patisserie treats layered for texture, freshness, and indulgence.",
  Macarons: "Delicate almond shells paired with smooth ganache and fruit-forward fillings.",
  Cheesecakes: "Creamy, slow-set cheesecakes on a buttery crumb base with elegant toppings.",
  "Gift Boxes": "Curated dessert assortments packed for birthdays, parties, and corporate gifting.",
};

export const catalogProducts = productBlueprints.flatMap(([categoryName, names], categoryIndex) =>
  names.map((name, itemIndex) => {
    const index = categoryIndex * 12 + itemIndex + 1;
    const category = categoryByName[categoryName];
    const base = 140 + categoryIndex * 35 + itemIndex * 18;
    const price = categoryName === "Gift Boxes" ? base + 420 : categoryName === "Cakes" ? base + 650 : base;
    const discount = itemIndex % 4 === 0 ? 12 : itemIndex % 7 === 0 ? 8 : 0;
    const imageSet = imagePool[categoryName];
    const image = imageSet[itemIndex % imageSet.length];

    return {
      _id: `demo-${index}`,
      name,
      slug: name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: `${notes[categoryName]} Made fresh in small batches with natural flavours, premium chocolate, and a signature Bindi's finish.`,
      price,
      originalPrice: discount ? Math.round(price / (1 - discount / 100)) : null,
      discount,
      category,
      quantity: 18 + ((index * 7) % 44),
      stock: 18 + ((index * 7) % 44),
      rating: Number((4.55 + ((index % 9) * 0.05)).toFixed(1)),
      reviewCount: 18 + ((index * 13) % 180),
      tag: tags[index % tags.length],
      tags: [categoryName, "Eggless", itemIndex % 2 ? "Party" : "Premium", itemIndex % 3 ? "Fresh" : "Gift"],
      featured: index % 3 === 0 || itemIndex < 2,
      trending: index % 4 === 0 || itemIndex === 1,
      seasonal: index % 8 === 0,
      images: [image, imageSet[(itemIndex + 1) % imageSet.length], imageSet[(itemIndex + 2) % imageSet.length]],
      image,
      shipping: true,
      reviews: [
        { name: "Aarohi", rating: 5, text: "Beautifully packed and tasted fresh. The texture felt premium." },
        { name: "Neel", rating: 5, text: "Ordered for a celebration and everyone asked where it was from." },
      ],
    };
  })
);

export function getProductImage(product) {
  if (!product) return "/logo.jpg";
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images[0]) return product.images[0];
  if (product._id && !String(product._id).startsWith("demo-")) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/product/product-photo/${product._id}`;
  }
  return "/logo.jpg";
}

export function normalizeProducts(products) {
  return Array.isArray(products) && products.length ? products : catalogProducts;
}

export function findCatalogProduct(slug) {
  return catalogProducts.find((product) => product.slug === slug);
}

export function getCatalogByCategory(slug) {
  return catalogProducts.filter((product) => product.category.slug === slug);
}
