const Tag = require('../models/tag');

// GET /tags - Lista tuturor tag-urilor
const getAllTags = async (req, res, next) => {
    try {
        const tags = await Tag.findAll();
        return res.json(tags);
    } catch (error) {
        next(error);
    }
};

// POST /tags - Creare tag personalizat
const createTag = async (req, res, next) => {
    try {
        let { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Tag name is required." });
        }

        name = name.trim(); 

        // Verific daca exista deja tag-ul
        const existingTag = await Tag.findOne({ where: { name: name } });

        if (existingTag) {
            return res.status(409).json({ message: "Tag already exists.", tag: existingTag });
        }

        // Creez tag-ul nou
        const newTag = await Tag.create({
            name: name,
            isDefault: false 
        });

        return res.status(201).json(newTag);

    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getAllTags,
    createTag 
};