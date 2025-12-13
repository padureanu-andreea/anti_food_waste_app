const { Product } = require('../models');

// POST /inventory/
/*
 * Creates a new product in the inventory.
 * * This function allows an authenticated user to add a new item to their inventory.
 * It performs validation on required fields (name, category, quantity, expiry date)
 * and links the product to the current user (ownerId) derived from the auth token.
 */
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

// GET /inventory/
/*
 * Retrieves a list of all products.
 * * This function fetches the inventory with support for filtering and sorting.
 * Users can filter by 'category' or 'status' and sort the results by expiration date,
 * creation date, or name. The default sort order highlights items expiring soonest.
 */
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

// GET /inventory/:id
/*
 * Retrieves details for a specific product.
 * * This function fetches a single product by its unique ID.
 * It returns the product object if found, or a 404 error if the ID does not exist.
 */
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

// PATCH /inventory/:id
/*
 * Updates an existing product.
 * * This function modifies the details of a specific product identified by ID.
 * It uses the data provided in the request body to update the corresponding fields
 * in the database.
 */
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

// DELETE /inventory/:id
/*
 * Deletes a product from the inventory.
 * * This function permanently removes a product record from the database
 * based on the provided ID. It returns a 204 No Content status upon success.
 */
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