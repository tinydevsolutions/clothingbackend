import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import HomepageSection from '../models/HomepageSection.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    let keyword = {};
    if (req.query.keyword) {
      const keywords = req.query.keyword.trim().split(/\s+/);
      // Logic: Each word in the search must match at least one field (Name, Color, Type, Desc)
      keyword = {
        $and: keywords.map(kw => ({
          $or: [
            { name: { $regex: kw, $options: 'i' } },
            { "variants.color": { $regex: kw, $options: 'i' } },
            { templateType: { $regex: kw, $options: 'i' } },
            { description: { $regex: kw, $options: 'i' } }
          ]
        }))
      };
    }

    const products = await Product.find({ ...keyword, status: 'Active' })
      .populate('category', 'name slug');
      
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    // Intelligently check if the parameter is a 24-char ObjectId or a human-readable slug string
    const isObjectId = mongoose.isValidObjectId(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const product = await Product.findOne(query).populate('category', 'name');

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const product = new Product({
      name: req.body.name || `Draft Product ${Date.now()}`,
      price: req.body.price || 0,
      description: req.body.description || 'Draft description',
      category: req.body.category || null,
      status: 'Draft', // Default draft
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const {
      name, price, salePrice, description, shortDescription, category,
      images, templateType, variants, sku, baseStock, status, flags, seo
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name ?? product.name;
      product.price = price ?? product.price;
      product.salePrice = salePrice ?? product.salePrice;
      product.description = description ?? product.description;
      product.shortDescription = shortDescription ?? product.shortDescription;
      product.category = category ?? product.category;
      product.images = images ?? product.images;
      product.templateType = templateType ?? product.templateType;
      product.variants = variants ?? product.variants;
      product.sku = sku ?? product.sku;
      product.baseStock = baseStock ?? product.baseStock;
      product.status = status ?? product.status;
      product.flags = flags ?? product.flags;
      product.seo = seo ?? product.seo;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      
      // Cascading Cleanup: Remove product from all Homepage Sections
      await HomepageSection.updateMany(
         { "referencedItems.itemId": product._id },
         { $pull: { referencedItems: { itemId: product._id } } }
      );

      res.json({ message: 'Product removed and references cleared' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Clone a product
// @route   POST /api/products/:id/clone
// @access  Private/Admin
export const cloneProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const clonedProduct = new Product({
        name: `${product.name} - Clone`,
        price: product.price,
        description: product.description,
        category: product.category,
        templateType: product.templateType,
        variants: product.variants, // cloned exactly
        status: 'Draft',
        // Omit SKU to prevent uniqueness errors
      });

      const savedClone = await clonedProduct.save();
      res.status(201).json(savedClone);
    } else {
      res.status(404);
      throw new Error('Product to clone not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};
