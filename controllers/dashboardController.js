const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// @route GET /api/dashboard/summary
const getSummary = async (req, res, next) => {
  try {
    const [totalOrders, totalMenuItems, revenueAgg, pendingCount] = await Promise.all([
      Order.countDocuments(),
      MenuItem.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ status: { $in: ["Pending", "Preparing"] } }),
    ]);

    res.json({
      totalOrders,
      totalMenuItems,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingOrders: pendingCount,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/dashboard/orders-by-status
const getOrdersByStatus = async (req, res, next) => {
  try {
    const result = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.json(result.map((r) => ({ status: r._id, count: r.count })));
  } catch (err) {
    next(err);
  }
};

// @route GET /api/dashboard/revenue-trend  (last 7 days)
const getRevenueTrend = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(result.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders })));
  } catch (err) {
    next(err);
  }
};

// @route GET /api/dashboard/top-items
const getTopItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find().sort({ timesOrdered: -1 }).limit(5);
    res.json(items.map((i) => ({ name: i.name, timesOrdered: i.timesOrdered })));
  } catch (err) {
    next(err);
  }
};

// @route GET /api/dashboard/order-type-split
const getOrderTypeSplit = async (req, res, next) => {
  try {
    const result = await Order.aggregate([
      { $group: { _id: "$orderType", count: { $sum: 1 } } },
    ]);
    res.json(result.map((r) => ({ type: r._id, count: r.count })));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  getOrdersByStatus,
  getRevenueTrend,
  getTopItems,
  getOrderTypeSplit,
};
