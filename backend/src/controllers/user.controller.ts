import { Response } from 'express';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 20, offset = 0, role } = req.query;

    const query: any = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    // Users can only view their own profile unless they're admin
    if (requestingUser?.role !== 'admin' && requestingUser?._id.toString() !== id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const requestingUser = req.user;

    // Users can only update their own profile unless they're admin
    if (requestingUser?.role !== 'admin' && requestingUser?._id.toString() !== id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Prevent non-admins from changing role
    if (requestingUser?.role !== 'admin' && updates.role) {
      delete updates.role;
    }

    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).select(
      '-password'
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
