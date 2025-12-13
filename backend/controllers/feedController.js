const { Op } = require("sequelize")

const Product = require("../models/product")
const ProductVisibility = require("../models/productVisibility")
const Group = require("../models/group")
const GroupMember = require("../models/groupMember")


// GET /feed/products
/*
 * Retrieves the personalized feed of products for the current user.
 * * This function fetches products that are visible to the user. The complex query enforces 
 * visibility rules by joining tables to ensure the user is a member of the group 
 * where the product was shared (Product -> ProductVisibility -> Group -> GroupMember).
 * * It supports filtering by owner, status, category, and expiration date (range), 
 * and sorts the results by expiration date (sooner first).
 */
const getProductsForMe = async (req, res, next) => {
    try {
        const { ownerId, category, expiryBefore, expiryAfter, status } = req.query

        const filterList = {}

        if (ownerId)
            filterList.ownerId = ownerId

        if (status)
            filterList.status = status

        if (expiryBefore || expiryAfter) {
            filterList.expiryDate = {};
            if (expiryBefore) {
                filterList.expiryDate[Op.lte] = expiryBefore;
            }
            if (expiryAfter) {
                filterList.expiryDate[Op.gte] = expiryAfter;
            }
        }

        if (category) {
            const categories = category.split(",").map(c => c.trim());
            filterList.category = { [Op.in]: categories };
        }

        const products = await Product.findAll(
            {
                where: filterList,
                include: [
                    {
                        model: ProductVisibility,
                        required:true,
                        include: [
                        {
                            model: Group,
                            required:true,
                            include:[
                                {
                                    model: GroupMember,
                                    required: true,
                                    where: {userId : req.user.id}
                                }
                            ]
                        }
                        ]
                    }
                ],
                order:[["expiryDate","ASC"]]
            }
        )

        return res.status(200).json(products)


    }
    catch (error) {
        next(error)
    }
}

module.exports = { getProductsForMe }