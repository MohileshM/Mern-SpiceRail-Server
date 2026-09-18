const express = require("express");
const router = express.Router();
const {
  getSummary,
  getOrdersByStatus,
  getRevenueTrend,
  getTopItems,
  getOrderTypeSplit,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

router.get("/summary", protect, getSummary);
router.get("/orders-by-status", protect, getOrdersByStatus);
router.get("/revenue-trend", protect, getRevenueTrend);
router.get("/top-items", protect, getTopItems);
router.get("/order-type-split", protect, getOrderTypeSplit);

module.exports = router;
