import { User } from '../models/user.models.js';
import welcomeEmail from '../services/welcome.email.js';
import sendAdminEmail from '../services/emailAdmin.js';

export const Signup = async (req, res) => {
    console.log(req.body);
    const { clerkUserId, FirstName, lastName, Email, Password, Token, ProfileImage } = req.body;
    if (!FirstName || !lastName || !Email) {
        return res.status(400).json({ msg: 'all detail required' });
    }
    const FullName = `${FirstName} ${lastName}`;
    const ExistUser = await User.findOne({ Email });

    if (ExistUser) {
        return res.status(200).json({ msg: 'user already exist not need to store' });
    }

    try {
        const user = await User.create({
            clerkUserId,
            FullName: FullName,
            LastName: lastName,
            Email: Email,
            Password: Password,
            ProfileImage,
        });
        const createduser = await User.findById(user._id).select('-password');
        const option = {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        };
        if (createduser) {
            welcomeEmail(FullName, Email, 'Welcome to Sri Venkateswara Agros and Herbs');
            return res
                .status(200)
                .cookie('authToken', Token, option)
                .json({ msg: 'user created sucseesfully !!!!', user });
        }
    } catch (error) {
        console.log(`error come from create user side controller ${error}`);
        return res.status(400).json({ msg: 'somthing went wrong !!!' });
    }
};

export const getAllUser = async (req, res) => {
    try {
        const users = await User.find().select('FullName Email ProfileImage  ');
        if (!users.length) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json({ message: 'Users found', users });
    } catch (error) {
        console.error('Error in getAllUser:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        console.log(user);
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }
        return res.status(200).json({ message: "User found", user });
    } catch (error) {
        console.error("Error in getUser:", error);
        return res.status(500).json({ msg: "Internal server error", error });
    }
  };

export const getAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
        console.log(user);
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }
        return res.status(200).json({ message: "User found", user });
    } catch (error) {
        console.error("Error in getUser:", error);
        return res.status(500).json({ msg: "Internal server error", error });
    }
  };


export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('User ID to delete:', id);

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ messege: 'User not found' });
        }
        res.status(200).json({ messege: 'User deleted successfully', user });
    } catch (error) {
        console.log(error);
    }
};

export const EmailByAdmin = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: name, email, subject, message',
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
            });
        }

        // Send the email
        await sendAdminEmail(name, email, subject, message);

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            data: {
                recipient: email,
                subject: subject,
                sentAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Admin email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

export const getUserByClerkId = async (req, res) => {
    const { clerkId } = req.params;
    try {
        if (!clerkId) return res.status(404).json({ error: 'Clerk ID is required' });
        const user = await User.find({ clerkUserId: clerkId });
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export const getUserAddress = async (req, res) => {
    const { userId } = req.params;
    try {
        const addressFound = await User.findById(userId).select('address phoneNumber');
        if (!userId || !addressFound) {
            return res
                .status(400)
                .json({ success: false, message: 'User ID is req. OR Address not added.' });
        }
        return res.status(200).json({ address: addressFound });
    } catch (error) {
        console.log(`Error getting User's address: ${error}`);
    }
};

export const updateUserAddress = async (req, res) => {
    const { userId } = req.params;
    const { addressId, newAddress } = req.body;
    if (!userId || !addressId || !newAddress)
        return res
            .status(400)
            .json({ message: 'Both User and address ID is required OR new Address Missing!' });
    try {
        const userFound = await User.findById(userId);
        if (Array.isArray(userFound.address)) {
            const matchedAddress = userFound.address.find(
                addr => addr._id.toString() === addressId.toString(),
            );
            matchedAddress.addressLine1 = newAddress.addressLine1;
            matchedAddress.addressLine2 = newAddress.addressLine2;
            matchedAddress.city = newAddress.city;
            matchedAddress.state = newAddress.state;
            matchedAddress.country = newAddress.country;
            matchedAddress.pinCode = newAddress.pinCode;
            matchedAddress.phone = newAddress.phone;
            await userFound.save();
            return res.status(200).json({ updatedAddress: matchedAddress });
        } else {
            throw new Error('Address is undefined or not an array');
        }
        return;
    } catch (error) {
        console.log(error);
        return res.status(500).json({});
    }
};

export const addNewAddress = async (req, res) => {
    const { userId } = req.params;
    const { newAddress } = req.body;
    try {
        const userFound = await User.findById(userId);
        userFound.address.push(newAddress);
        await userFound.save();
        return res.status(200).json({ success: true, message: 'Address Added Successfully' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export const deleteAddress = async (req, res) => {
    const { userId, addressId } = req.params;

    try {
        const result = await User.updateOne(
            { _id: userId },
            { $pull: { address: { _id: addressId } } },
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Address not found or already deleted' });
        }

        return res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
