const { Op } = require("sequelize")

const Product = require("../models/product")
const ProductVisibility = require("../models/productVisibility")
const Group = require("../models/group")
const GroupMember = require("../models/groupMember")

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