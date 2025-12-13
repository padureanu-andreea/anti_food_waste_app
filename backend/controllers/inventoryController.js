const { Product } = require('../models');

const createProduct = async (req, res, next) => {
    try {
        const ownerId = req.user.id;
        let { name, category, quantity, expiryDate, notes } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "name is required" });
        }
        if (!category || !category.trim()) {
            return res.status(400).json({ message: "category is required" });
        }
        if (!quantity || !quantity.trim()) {
            return res.status(400).json({ message: "quantity is required" });
        }
        if (!expiryDate) {
            return res.status(400).json({ message: "expiryDate is required (YYYY-MM-DD)" });
        }

        const product = await Product.create({
            ownerId,
            name: name.trim(),
            category: category.trim(),
            quantity: quantity.trim(),
            expiryDate,                
            notes: notes?.trim() || null
        });

        return res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        next(error);
    }
};

const getAllProducts = async (req, res, next) => {
    try {
        const { category, status, sort, order } = req.query;

        const whereClause = {ownerId: req.user.id};
        if (category) {
            whereClause.category = category;
        }
        if (status) {
            whereClause.status = status;
        }

        let orderClause = [['expiryDate', 'ASC']];

        if (sort) {
            const sortField = sort === 'expiry_date' ? 'expiryDate' :
                sort === 'created_at' ? 'createdAt' :
                    'name';
            const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
            orderClause = [[sortField, sortOrder]];
        }

        const products = await Product.findAll({
            where: whereClause,
            order: orderClause
        });

        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where: {
                id: id,
                ownerId: req.user.id
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where: {
                id: id,
                ownerId: req.user.id
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.update(req.body);
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where: {
                id: id,
                ownerId: req.user.id
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.destroy();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};