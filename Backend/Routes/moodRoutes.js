import express from "express";
import Product from "../Models/ProductModels.js";

const router = express.Router();

router.get("/recommend/:mood", async (req, res) => {
  try {
    const mood = req.params.mood?.toLowerCase();

    // Better realistic mood → filter mapping
    let filter = {};

    switch (mood) {
      case "happy":
        filter = { price: { $lte: 200 } };
        break;

      case "comfort":
        filter = { name: { $regex: "Chocolate|Brownie|Dark|Fudge", $options: "i" } };
        break;

      case "celebration":
        filter = { price: { $gte: 180 } };
        break;

      case "calm":
        filter = { 
          name: { $regex: "Vanilla|Coconut|Classic|Plain", $options: "i" } 
        };
        break;

      case "excited":
        filter = { 
          name: { $regex: "Truffle|Mint|Chilli|Cranberry|Blueberry", $options: "i" } 
        };
        break;

      case "romantic":
        filter = { 
          name: { $regex: "Red Velvet|Strawberry|Rose", $options: "i" } 
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid mood. Try: happy, comfort, celebration, calm, excited, romantic"
        });
    }

    // 🎯 Random + limited + lightweight products
    let products = await Product.aggregate([
      { $match: filter },
      { $sample: { size: 10 } },         // randomize results
      { 
        $project: {                      // remove heavy photo buffer
          photo: 0
        } 
      }
    ]);

    // Fallback → if no mood match products found return random good stuff
    if (!products.length) {
      products = await Product.aggregate([
        { $sample: { size: 10 } },
        { $project: { photo: 0 } }
      ]);
    }

    res.status(200).json({
      success: true,
      mood,
      count: products.length,
      products
    });

  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong in recommendation 😢",
      error: error.message
    });
  }
});
export default router;
