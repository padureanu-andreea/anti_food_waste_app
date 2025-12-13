const { Claim, Product, User } = require('../models');

// POST /inventory/:id/claims
/*
 * Creates a new claim request for a product.
 * * This function allows an authenticated user to request (claim) a specific product. 
 * It validates that the product exists and is currently marked as 'available'. 
 * If valid, it creates a new claim record with a 'pending' status.
 */
const createClaim = async (req, res) => {
    try {
        const { id } = req.params; 
        const claimerId = req.user.id; 

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found!' });
        }
        if (product.status !== 'available') {
            return res.status(400).json({ message: 'This product is no longer available!' });
        }

        const claim = await Claim.create({
            productId: id,
            claimerId: claimerId,
            status: 'pending'
        });

        res.status(201).json(claim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /claims
/*
 * Retrieves a list of claims based on the user's role.
 * * This function filters claims based on the 'as' query parameter. 
 * If 'as' is 'claimer', it returns claims made *by* the specified user. 
 * If 'as' is 'owner', it returns claims made *on* products owned by the specified user.
 */
const getClaims = async (req, res) => {
    try {
        const { as, userId } = req.query; 

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
                        model: User 
                    }
                ]
            });
        } else {
            return res.status(400).json({ message: 'The "as" parameter must be "claimer" or "owner".' });
        }

        res.status(200).json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /inventory/:id/claims
/*
 * Fetches all claims associated with a specific product.
 * * This function retrieves the history of claims for a single product ID. 
 * It includes details about the users who made the claims, allowing the owner 
 * to see who is interested in their item.
 */
const getClaimsForProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const claims = await Claim.findAll({
            where: { productId: id },
            include: [{ model: User }] 
        });
        res.status(200).json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
const updateClaimStatus = async (req, res) => {
    try {
        const { id } = req.params; 
        const { status } = req.body; // 'approved' sau 'rejected'

        const claim = await Claim.findByPk(id, { include: Product });
        if (!claim) {
            return res.status(404).json({ message: 'Claim not found!' });
        }

        if (status === 'approved') {
            // if we accept the request we must change the product status to "claimed"
            const product = await Product.findByPk(claim.productId);
            
            if (product.status !== 'available') {
                return res.status(400).json({ message: 'This product is no longer available!' });
            }

            product.status = 'claimed';
            await product.save();
        }

        claim.status = status;
        await claim.save();

        res.status(200).json(claim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createClaim,
    getClaims,
    getClaimsForProduct,
    updateClaimStatus
};