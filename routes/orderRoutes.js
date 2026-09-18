const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);
router.post("/", protect, createOrder);
router.patch("/:id/status", protect, updateOrderStatus);
router.patch("/:id/payment", protect, updatePaymentStatus);
router.delete("/:id", protect, deleteOrder);

module.exports = router;
