const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Starters",
        "Main Course",
        "Beverages",
        "Desserts",
        "Fast Food",
        "Combos",
      ],
    },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: "" },
    image: { type: String, default: "" }, // URL or emoji fallback used on frontend
    available: { type: Boolean, default: true },
    timesOrdered: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
