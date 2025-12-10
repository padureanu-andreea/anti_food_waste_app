// Express Initialisation
const express = require("express");
const app = express();
const port = 3000;

// Sequelize Initialisation
const sequelize = require("./config/db");

// Import created models
const User = require('./User');
const Group = require('./Group');
const Tag = require('./Tag');
const GroupMember = require('./GroupMember');
const GroupMemberTag = require('./GroupMemberTag');


// Define relationship

// Un user poate fi membru în multe grupuri
User.belongsToMany(Group, {
  through: GroupMember,
  foreignKey: 'userId',
  otherKey: 'groupId'
});

// Un grup poate avea mulți useri membri
Group.belongsToMany(User, {
  through: GroupMember,
  foreignKey: 'groupId',
  otherKey: 'userId'
});

// Relații directe (pentru a obtine detalii)
GroupMember.belongsTo(User, { foreignKey: 'userId' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });

User.hasMany(GroupMember, { foreignKey: 'userId' });
Group.hasMany(GroupMember, { foreignKey: 'groupId' });


// Fiecare grup are un owner (un singur user)
Group.belongsTo(User, {
  as: 'owner',
  foreignKey: 'ownerId'
});

// Un user poate deține mai multe grupuri
User.hasMany(Group, {
  as: 'ownedGroups',
  foreignKey: 'ownerId'
});


// Taguri aplicate membrilor unui grup
GroupMemberTag.belongsTo(Group, { foreignKey: 'groupId' });
GroupMemberTag.belongsTo(User, { foreignKey: 'memberId' });
GroupMemberTag.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
GroupMemberTag.belongsTo(Tag, { foreignKey: 'tagId' });

Group.hasMany(GroupMemberTag, { foreignKey: 'groupId' });
User.hasMany(GroupMemberTag, { foreignKey: 'memberId' });
Tag.hasMany(GroupMemberTag, { foreignKey: 'tagId' });



// Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Start Express
app.listen(port, () => {
  console.log("The server is running on http://localhost:" + port);
});

// 500 error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]:" + err);
  res.status(500).json({ message: "500 - Server Error" });
});

// Special GET endpoint to sync DB
app.get("/", async (req, res, next) => {
  try {
    await sequelize.sync({ alter: true });
    res.status(201).json({ message: "Database ok." });
  } catch (err) {
    next(err);
  }
});
