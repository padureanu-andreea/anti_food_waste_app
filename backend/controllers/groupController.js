const { Op } = require("sequelize")


const Group = require("../models/group")
const GroupMember = require("../models/groupMember")
const User = require("../models/user")

// GET /groups/
/*
 * Retrieves all groups associated with the current user.
 * * This function fetches and categorizes groups into two lists: 
 * 1. 'owner': Groups created and owned by the user.
 * 2. 'member': Groups where the user is a participant but not the owner.
 */
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

        return res.json(myGroups) //even if the array is empty because in the UI we will display a empty list  -> the user doesn't belog to any group

    }
    catch (error) {
        next(error)
    }
}

// POST /groups/
/*
 * Creates a new group.
 * * This function initializes a new group with the provided name. 
 * It automatically assigns the authenticated user as the group's owner 
 * and immediately adds them as the first member of the group.
 */
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

// GET /groups/:id
/*
 * Retrieves detailed information about a specific group.
 * * This function fetches the group's metadata (id, name, owner). 
 * It acts as a security gate, ensuring that only the owner or existing members 
 * of the group are allowed to view these details.
 */
const viewGroupDetails = async (req, res, next) => {

    //details = owner name and name of the group

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

// PATCH /groups/:id
/*
 * Updates the name of a specific group.
 * * This function allows for the renaming of a group. 
 * Strict authorization is applied to ensure that only the creator/owner 
 * of the group has the permission to perform this update.
 */
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

        // only the owner can change the name
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

// DELETE /groups/:id
/*
 * Permanently deletes a group.
 * * This function handles the removal of a group from the system. 
 * It performs a cleanup by first removing all member associations (GroupMember) 
 * before deleting the group record itself. Only the owner can execute this action.
 */
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

        // first, we delete all members from the GroupMembers table
        await GroupMember.destroy({
            where: { groupId: groupId }
        })

        // then, we can safely remove this group
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

// DELETE /groups/:id/members
/*
 * Allows a user to leave a group.
 * * This function removes the current user from the member list of a specific group. 
 * It contains logic to prevent the 'owner' from leaving their own group; 
 * owners must delete the group instead of leaving it.
 */
const leaveGroup = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const userId = req.user.id

        const group = await Group.findByPk(groupId)
        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        // owner can not leave the group before he deletes it
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


// GET /groups/:id/members
/*
 * Retrieves a list of all members in a group.
 * * This function fetches the list of users who are part of the specified group. 
 * It includes user details (username, email) and ensures that the requestor 
 * is actually part of the group (or the owner) before releasing the data.
 */
const getMembersFromGroup = async (req, res, next) => {
    try {
        const groupId = Number(req.params.id)
        const userId = req.user.id

        const group = await Group.findByPk(groupId)
        if (!group)
            return res.status(404).json({ message: "Group not found" })

        //check user status
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

// POST /groups/:id/members
/*
 * Adds a new member to the group.
 * * This function allows the group owner to add another user to the group by their User ID. 
 * It performs checks to ensure the user exists and isn't already a member. 
 * Only the group owner is permitted to perform this action.
 */
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

module.exports = { getAllMyGroups, createGroup, viewGroupDetails, updateGroupName, deleteGroup, leaveGroup, getMembersFromGroup , addMemberInGroup}