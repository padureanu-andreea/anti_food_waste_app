const { Product } = require('../models');

const generateFacebookShare = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const product = await Product.findByPk(productId);
        
        if (!product) {
            return res.status(404).json({ message: "Product does not exist." });
        }

        // Verific dac produsul mai e disponibil
        if (product.status !== 'available') {
            return res.status(400).json({ message: "Only available products can be shared." });
        }

        const appLink = "http://localhost:3000"; 
        const message = `Donez ${product.name} prin aplicația AntiFoodWaste! Expiră pe ${product.expiryDate}. #AntiFoodWaste`;
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appLink)}&quote=${encodeURIComponent(message)}`;

        res.status(200).json({
            platform: 'facebook',
            productName: product.name,
            generatedMessage: message,
            shareUrl: shareUrl
        });

    } catch (error) {
        next(error); 
    }
};

const generateInstagramContent = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ message: "Product does not exist." });
        }

        // Verific statusul
        if (product.status !== 'available') {
            return res.status(400).json({ message: "Only available products can be shared." });
        }

        const message = `Donez ${product.name}! Expiră la: ${product.expiryDate}. Contactează-mă pe AntiFoodWaste App!  #StopFoodWaste`;

        res.status(200).json({
            platform: 'instagram',
            productName: product.name,
            generatedMessage: message,
            instruction: "Instagram nu permite postarea directă din web. Copiază acest text."
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateFacebookShare,
    generateInstagramContent
};