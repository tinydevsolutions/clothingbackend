import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// @desc    Create new order and optionally generate Razorpay order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    } else {
      // Business Logic: COD only for orders over ₹5,000
      if (paymentMethod === 'COD' && totalPrice < 5000) {
         res.status(400);
         throw new Error('Cash on Delivery is only available for orders over ₹5,000.');
      }

      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();

      // If Razorpay, generate a Razorpay order ID immediately and send back
      if (paymentMethod === 'Razorpay') {
        const instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
          key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
        });

        const options = {
          amount: Math.round(totalPrice * 100), // convert to paise
          currency: 'INR',
          receipt: createdOrder._id.toString(),
        };

        const razorpayOrder = await instance.orders.create(options);
        
        return res.status(201).json({
          order: createdOrder,
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
        });
      }

      // If COD
      res.status(201).json({ order: createdOrder });
    }
  } catch (error) {
    console.error('Order Creation Error:', error);
    next(error);
  }
};

// @desc    Verify Razorpay signature
// @route   POST /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      // Verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpay_signature) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: razorpay_payment_id,
          status: 'success',
          update_time: new Date().toISOString(),
          email_address: req.user.email,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
      } else {
        res.status(400);
        throw new Error('Invalid Razorpay signature');
      }
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.orderStatus = req.body.status || order.orderStatus;
      if (req.body.status === 'Delivered') {
        order.deliveredAt = Date.now();
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id firstName lastName');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/orders/stats/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const orders = await Order.find({});
    const products = await Product.find({});
    const usersCount = await User.countDocuments({});

    const totalRevenue = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

    // Find low stock variants
    const lowStockItems = [];
    products.forEach(p => {
       p.variants.forEach(v => {
          if (v.stock < 10) {
             lowStockItems.push({
                _id: p._id,
                name: p.name,
                size: v.size,
                color: v.color,
                stock: v.stock
             });
          }
       });
    });

    // Sales by month (last 6 months)
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
       const d = new Date();
       d.setMonth(d.getMonth() - i);
       const month = d.toLocaleString('default', { month: 'short' });
       const year = d.getFullYear();
       
       const monthTotal = orders
          .filter(o => {
             const od = new Date(o.createdAt);
             return od.getMonth() === d.getMonth() && od.getFullYear() === year && o.isPaid;
          })
          .reduce((sum, o) => sum + o.totalPrice, 0);

       monthlySales.push({ month, total: monthTotal });
    }

    res.json({
       totalRevenue,
       totalOrders,
       pendingOrders,
       totalCustomers: usersCount,
       totalProducts: products.length,
       lowStockItems: lowStockItems.slice(0, 5), // Top 5 alerts
       monthlySales
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Razorpay Key ID
// @route   GET /api/orders/config/razorpay
// @access  Private
export const getRazorpayKey = async (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID || '' });
};
