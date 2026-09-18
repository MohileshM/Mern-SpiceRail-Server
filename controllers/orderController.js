const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

const generateOrderNumber = () => {
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(100 + Math.random() * 900);
  return `ORD-${ts}${rand}`;
};

// @route GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const { status, orderType, search } = req.query;
    const filter = {};
    if (status && status !== "All") filter.status = status;
    if (orderType && orderType !== "All") filter.orderType = orderType;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { customerName, customerPhone, orderType, tableNumber, items, paymentMethod, notes } = req.body;

    if (!customerName || !items || !items.length) {
      return res.status(400).json({ message: "Customer name and at least one item are required" });
    }

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customerName,
      customerPhone,
      orderType,
      tableNumber,
      items,
      totalAmount,
      paymentMethod,
      notes,
      createdBy: req.user ? req.user._id : undefined,
    });

    // increment popularity counters, best-effort
    await Promise.all(
      items.map((i) =>
        i.menuItem
          ? MenuItem.findByIdAndUpdate(i.menuItem, { $inc: { timesOrdered: i.quantity } })
          : Promise.resolve()
      )
    );

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/orders/:id/payment
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/orders/:id
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
};
