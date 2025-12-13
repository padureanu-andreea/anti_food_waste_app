const { Claim, Product, User } = require('../models');

// POST /inventory/:id/claims
/*
 * Creates a new claim request for a product.
 * * This function allows an authenticated user to request (claim) a specific product. 
 * It validates that the product exists and is currently marked as 'available'. 
 * If valid, it creates a new claim record with a 'pending' status.
 */
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

// GET /claims
/*
 * Retrieves a list of claims based on the user's role.
 * * This function filters claims based on the 'as' query parameter. 
 * If 'as' is 'claimer', it returns claims made *by* the specified user. 
 * If 'as' is 'owner', it returns claims made *on* products owned by the specified user.
 */

const getClaims = async (req, res, next) => {
    try {
        const { as } = req.query; 
        const userId = req.user.id; 

        if (!userId) {
            return res.status(400).json({ message: 'userID parameter is required for filtering.' }); 
        }

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

// GET /inventory/:id/claims
/*
 * Fetches all claims associated with a specific product.
 * * This function retrieves the history of claims for a single product ID. 
 * It includes details about the users who made the claims, allowing the owner 
 * to see who is interested in their item.
 */
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


// PATCH /claims/:id
/*
 * Updates the status of a specific claim.
 * * This function handles the approval or rejection of a claim. 
 * If a claim is 'approved', it automatically updates the associated Product's status 
 * to 'claimed' to prevent further requests. It also performs a check to ensure 
 * the product is still available before approving.
 */
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