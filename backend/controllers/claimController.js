const { Claim, Product, User } = require('../models');

const createClaim = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const claimerId = req.user.id; 

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        if (product.status !== 'available') {
            return res.status(400).json({ message: 'This product is no longer available.' });
        }

        const claim = await Claim.create({
            productId: id,
            claimerId: claimerId,
            status: 'pending'
        });

        res.status(201).json(claim);
    } catch (error) {
        next(error);
    }
};

const getClaims = async (req, res, next) => {
    try {
        const { as } = req.query; 
        const userId = req.user.id; 

        let claims;

        if (as === 'claimer') {
            claims = await Claim.findAll({
                where: { claimerId: userId },
                include: [{ model: Product }] 
            });
        } else if (as === 'owner') {
            claims = await Claim.findAll({
                include: [
                    { 
                        model: Product, 
                        where: { ownerId: userId } 
                    },
                    {
                        model: User,
                        attributes: ['id', 'username', 'email', 'phone'] 
                    }
                ]
            });
        } else {
            return res.status(400).json({ message: 'Parameter "as" has to be "claimer" or "owner".' });
        }

        res.status(200).json(claims);
    } catch (error) {
        next(error);
    }
};

const getClaimsForProduct = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id; 

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        if (product.ownerId !== userId) {
            return res.status(403).json({ message: 'Access denied. Only the owner can see the claims.' });
        }

        const claims = await Claim.findAll({
            where: { productId: id },
            include: [{ 
                model: User,
                attributes: ['id', 'username', 'email', 'phone', 'bio'] 
            }] 
        });

        res.status(200).json(claims);
    } catch (error) {
        next(error);
    }
};

const updateClaimStatus = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const { status } = req.body; // 'approved' sau 'rejected'

        const claim = await Claim.findByPk(id, { include: Product });
        if (!claim) {
            return res.status(404).json({ message: 'The claim does not exist.' });
        }

        if (claim.Product.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'You do not have the right to approve claims for this product.' });
        }

        if (status === 'approved') {
            // Daca accept cererea, trebuie sa marchez produsul ca "claimed"
            const product = await Product.findByPk(claim.productId);
            
            if (product.status !== 'available') {
                return res.status(400).json({ message: 'Product no longer available.' });
            }

            product.status = 'claimed';
            await product.save();
        }

        claim.status = status;
        await claim.save();

        res.status(200).json(claim);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createClaim,
    getClaims,
    getClaimsForProduct,
    updateClaimStatus
};