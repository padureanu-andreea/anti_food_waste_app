const { Claim, Product, User } = require('../models');

const createClaim = async (req, res) => {
    try {
        const { id } = req.params; 
        const { claimerId } = req.body; 

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Produsul nu a fost găsit.' });
        }
        if (product.status !== 'available') {
            return res.status(400).json({ message: 'Acest produs nu mai este disponibil.' });
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

const getClaims = async (req, res) => {
    try {
        const { as, userId } = req.query; 

        if (!userId) {
            return res.status(400).json({ message: 'Parametrul userId este obligatoriu pentru filtrare.' });
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
            return res.status(400).json({ message: 'Parametrul "as" trebuie să fie "claimer" sau "owner".' });
        }

        res.status(200).json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

const updateClaimStatus = async (req, res) => {
    try {
        const { id } = req.params; 
        const { status } = req.body; // 'approved' sau 'rejected'

        const claim = await Claim.findByPk(id, { include: Product });
        if (!claim) {
            return res.status(404).json({ message: 'Revendicarea nu există.' });
        }

        if (status === 'approved') {
            // Dacă acceptăm cererea, trebuie să marcam produsul ca "claimed"
            const product = await Product.findByPk(claim.productId);
            
            if (product.status !== 'available') {
                return res.status(400).json({ message: 'Produsul nu mai este disponibil.' });
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