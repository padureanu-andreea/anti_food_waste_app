const { Op } = require("sequelize")


const Group = require("../models/group")
const GroupMember = require("../models/groupMember")
const User = require("../models/user")


const getAllMyGroups = async (req, res, next) => {
    try {
        const myGroups = []
        const myOwnerGroups = await Group.findAll({
            where: { ownerId: req.user.id }
        })

        if (myOwnerGroups.length > 0) {
            myGroups.push({
                status: "owner",
                groups: myOwnerGroups
            })

        }

        const myMemberGroups = await Group.findAll({
            where: { ownerId: { [Op.ne]: req.user.id } },
            include: [
                {
                    model: GroupMember,
                    where: { userId: req.user.id },
                    required: true
                }
            ]
        })

        if (myMemberGroups.length > 0) {
            myGroups.push({
                status: "member",
                groups: myMemberGroups
            })
        }

        return res.json(myGroups) //chiar daca array ul e gol pt ca daca nu face parte din niciun grup voi afisa o lista goala in UI

    }
    catch (error) {
        next(error)
    }
}

const createGroup = async (req, res, next) => {
    try {
        const name = req.body.name
        const ownerId = req.user.id

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group name is required" })
        }

        const groupCreated = await Group.create({
            name: name,
            ownerId: ownerId
        })

        if (!groupCreated)
            return res.status(400).json({ message: "Group failed to create!" })

        await GroupMember.create({
            groupId: groupCreated.id,
            userId: ownerId
        })

        return res.status(201).json({ message: "Group craeted successfully!" })

    } catch (error) {
        next(error)
    }
}

const viewGroupDetails = async (req, res, next) => {

    //detalii adica numele si owner ul

    try {
        const groupId = Number(req.params.id)
        const group = await Group.findByPk(groupId)


        if (!group)
            return res.status(404).json({ message: "Group not found!" })

        if (group.ownerId !== req.user.id) {
            const isMember = await GroupMember.findOne({
                where: {
                    groupId: groupId,
                    userId: req.user.id
                }
            })

            if (!isMember) {
                return res.status(403).json({ message: "Access denied!" })
            }
        }

        const owner = await User.findByPk(group.ownerId, {
            attributes: ["id", "username"]
        })

        return res.json({
            id: group.id,
            name: group.name,
            owner: owner
        })

    } catch (error) {
        next(error)
    }

}


const updateGroupName = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const { name } = req.body
        const userId = req.user.id

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group name is required" })
        }

        const group = await Group.findByPk(groupId)

        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        // doar owner-ul poate modifica
        if (group.ownerId !== userId) {
            return res.status(403).json({ message: "Only the owner can update the group" })
        }

        group.name = name.trim()
        await group.save()

        return res.json({
            message: "Group name updated successfully",
            group: {
                id: group.id,
                name: group.name
            }
        })

    } catch (error) {
        next(error)
    }
}

const deleteGroup = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const userId = req.user.id

        const group = await Group.findByPk(groupId)
        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        if (group.ownerId !== userId) {
            return res.status(403).json({
                message: "Only the owner can delete this group"
            })
        }

        // stregrea membrilor mai intai
        await GroupMember.destroy({
            where: { groupId: groupId }
        })

        // stergerea efectiva a grupului
        await Group.destroy({
            where: { id: groupId }
        })

        return res.status(200).json({
            message: "Group deleted successfully"
        })

    } catch (error) {
        next(error)
    }
}

const leaveGroup = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const userId = req.user.id

        const group = await Group.findByPk(groupId)
        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        // owner ul n are voie sa paraeasca grupul 
        if (group.ownerId === userId) {
            return res.status(403).json({
                message: "Owner cannot leave the group. Delete the group."
            })
        }

        const deleted = await GroupMember.destroy({
            where: {
                groupId: groupId,
                userId:userId
            }
        })

        if (deleted === 0) {
            return res.status(404).json({ message: "You are not a member of this group" })
        }

        return res.status(200).json({
            message: "You left the group successfully"
        })

    } catch (error) {
        next(error)
    }
}

const getMembersFromGroup = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const userId = req.user.id

        const group = await Group.findByPk(groupId)
        if (!group)
            return res.status(404).json({ message: "Group not found" })

        //verificare statut 
        if (group.ownerId !== userId) {
            const isMember = await GroupMember.findOne({
                where: { groupId: groupId,
                     userId: userId }
            });

            if (!isMember)
                return res.status(403).json({ message: "Access denied" })
        }

        const members = await GroupMember.findAll({
            where: { groupId : groupId },
            include: [
                {
                    model: User,
                    attributes: ["id", "username", "email"]
                }
            ]
        })

        return res.json({
            groupId,
            members: members.map(m => ({
                id: m.User.id,
                username: m.User.username,
                email: m.User.email
            }))
        });

    } catch (error) {
        next(error)
    }
}

const addMemberInGroup = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const ownerId = req.user.id
        const { userId } = req.body

        if (!userId)
            return res.status(400).json({ message: "userId is required" })

        const group = await Group.findByPk(groupId)
        if (!group)
            return res.status(404).json({ message: "Group not found" })

        if (group.ownerId !== ownerId)
            return res.status(403).json({ message: "Only owner can add members" })

        const user = await User.findByPk(userId)
        if (!user)
            return res.status(404).json({ message: "User not found" })

        const alreadyMember = await GroupMember.findOne({
            where: { groupId: groupId, 
                userId: userId }
        })

        if (alreadyMember)
            return res.status(409).json({ message: "User already in group" })

        await GroupMember.create({ 
            groupId: groupId, 
            userId:userId })

        return res.status(201).json({
            message: "Member added successfully",
            member: {
                id: user.id,
                username: user.username
            }
        })

    } catch (error) {
        next(error)
    }
}

//rute generale


module.exports = { getAllMyGroups, createGroup, viewGroupDetails, updateGroupName, deleteGroup, leaveGroup, getMembersFromGroup , addMemberInGroup}