import dotenv from "dotenv";
import slugify from "slugify";
import connectDB from "./Config/db.js";
import categoryModel from "./Models/CategoryModels.js";
import productModel from "./Models/ProductModels.js";

dotenv.config();

const catalog = {
  Cupcakes: ["Belgian Chocolate Cloud Cupcake", "Vanilla Bean Confetti Cupcake", "Rose Pistachio Cupcake", "Salted Caramel Crunch Cupcake", "Strawberry Shortcake Cupcake", "Red Velvet Cream Cheese Cupcake", "Nutella Truffle Cupcake", "Lemon Blueberry Cupcake", "Mocha Fudge Cupcake", "Rasmalai Royale Cupcake", "Biscoff Buttercream Cupcake", "Dark Cherry Ganache Cupcake"],
  Cakes: ["Signature Chocolate Fudge Cake", "Fresh Strawberry Cream Cake", "Lotus Biscoff Celebration Cake", "Classic Black Forest Cake", "Mango Saffron Mousse Cake", "Dutch Truffle Layer Cake", "Rasmalai Pistachio Cake", "Blueberry Cheesecake Gateau", "Hazelnut Praline Cake", "Rose Gold Birthday Cake", "Cookies and Cream Cake", "Caramel Almond Opera Cake"],
  Brownies: ["Classic Walnut Fudge Brownie", "Triple Chocolate Brownie Tub", "Biscoff Blondie Squares", "Sea Salt Caramel Brownie", "Nutella Swirl Brownie", "Rocky Road Brownie Box", "Espresso Ganache Brownie", "Raspberry Dark Chocolate Brownie", "Celebration Brownie Slab"],
  Cookies: ["Choco-Dip Butter Cookies", "Brown Butter Chocolate Chunk Cookies", "Red Velvet Cream Cookies", "Double Cocoa Crinkle Cookies", "Pistachio Rose Shortbread", "Oatmeal Cranberry Cookies", "Biscoff Stuffed Cookies", "Nutella Lava Cookies", "Vanilla Sprinkle Cookies"],
  Pastries: ["Chocolate Truffle Pastry", "Mille-Feuille Vanilla Pastry", "Tiramisu Cream Cup", "Strawberry Choux Pastry", "Pineapple Fresh Cream Pastry", "Hazelnut Eclair", "Mocha Almond Pastry", "Blueberry Cream Pastry"],
  Macarons: ["Assorted French Macaron Box", "Rose Lychee Macarons", "Chocolate Hazelnut Macarons", "Salted Caramel Macarons", "Pistachio Gold Macarons", "Raspberry Vanilla Macarons", "Coffee Ganache Macarons", "Mango Passion Macarons"],
  Cheesecakes: ["New York Vanilla Cheesecake", "Blueberry Swirl Cheesecake", "Biscoff Mini Cheesecake", "Mango No-Bake Cheesecake", "Chocolate Marble Cheesecake", "Strawberry Jar Cheesecake"],
  "Gift Boxes": ["Celebration Dessert Hamper", "Premium Brownie Gift Box", "Cupcake Party Box", "Festive Mithai Dessert Box", "Cookie and Macaron Duo Box", "Birthday Bestseller Combo", "Corporate Dessert Hamper", "Mini Indulgence Sampler"],
};

const descriptions = {
  Cupcakes: "A soft, eggless cupcake finished with silky buttercream and bakery-made toppings.",
  Cakes: "A celebration-ready eggless cake layered with premium creams, fillings, and rich finishes.",
  Brownies: "Dense, fudgy, slow-baked brownies made with couverture-style chocolate notes.",
  Cookies: "Golden, buttery cookies with crisp edges, soft centers, and generous inclusions.",
  Pastries: "Single-serve patisserie treats layered for texture, freshness, and indulgence.",
  Macarons: "Delicate almond shells paired with smooth ganache and fruit-forward fillings.",
  Cheesecakes: "Creamy, slow-set cheesecakes on a buttery crumb base with elegant toppings.",
  "Gift Boxes": "Curated dessert assortments packed for birthdays, parties, and corporate gifting.",
};

async function seed() {
  await connectDB();

  const categories = {};
  for (const name of Object.keys(catalog)) {
    const category = await categoryModel.findOneAndUpdate(
      { slug: slugify(name, { lower: true }) },
      { name, slug: slugify(name, { lower: true }) },
      { new: true, upsert: true }
    );
    categories[name] = category;
  }

  let count = 0;
  for (const [categoryName, names] of Object.entries(catalog)) {
    for (const [index, name] of names.entries()) {
      const sequence = count + 1;
      const price = categoryName === "Gift Boxes" ? 560 + index * 90 : categoryName === "Cakes" ? 799 + index * 75 : 149 + count * 12;
      await productModel.findOneAndUpdate(
        { slug: slugify(name, { lower: true }) },
        {
          name,
          slug: slugify(name, { lower: true }),
          description: `${descriptions[categoryName]} Made fresh in small batches with natural flavours and a signature Bindi's finish.`,
          price,
          category: categories[categoryName]._id,
          quantity: 18 + ((sequence * 7) % 44),
          shipping: true,
          featured: sequence % 3 === 0 || index < 2,
          rating: Number((4.55 + ((sequence % 9) * 0.05)).toFixed(1)),
          reviewCount: 18 + ((sequence * 13) % 180),
          tag: sequence % 4 === 0 ? "Bestseller" : sequence % 5 === 0 ? "New" : "Fresh Today",
        },
        { new: true, upsert: true }
      );
      count += 1;
    }
  }

  console.log(`Seeded ${count} premium bakery products across ${Object.keys(catalog).length} categories.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
