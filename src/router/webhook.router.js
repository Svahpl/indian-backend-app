import { Router } from 'express';
import { Webhook } from 'svix';
import { User } from '../models/user.models.js';
import welcomeEmail from '../services/welcome.email.js';
export const webhookRouter = Router();

webhookRouter.post('/register', async (req, res) => {
    console.log('Incoming webhook request...');

    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('Missing WEBHOOK_SECRET');
        return res.status(500).json({ msg: 'Missing webhook secret in env file' });
    }

    const svixId = req.headers['svix-id'];
    const svixTimestamp = req.headers['svix-timestamp'];
    const svixSignature = req.headers['svix-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
        return res.status(400).json({ msg: 'Missing required Svix headers' });
    }

    const payload = req.body;
    const headers = {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
    };

    const wh = new Webhook(webhookSecret);
    let evt;

    try {
        evt = wh.verify(payload, headers);
        console.log('Webhook verified successfully');
    } catch (err) {
        console.error('Webhook verification failed:', err.message);
        return res.status(400).json({ msg: 'Invalid webhook signature' });
    }

    console.log('Event type:', evt.type);

    // Handle different event types
    try {
        if (evt.type === 'user.created') {
            const userData = evt.data;
            const clerkUserId = userData.id; // Clerk user ID

            console.log('Creating new user with Clerk ID:', clerkUserId);

            // Transform Clerk data to match your User model
            const email = userData.email_addresses?.[0]?.email_address;
            const fullName =
                [userData.first_name, userData.last_name].filter(Boolean).join(' ') ||
                'Unknown User';

            if (!email) {
                throw new Error('No email address found in user data');
            }

            const userExists = await User.findOne({ Email: email });

            if (userExists) {
                return res.status(200).json({ msg: 'user already exists' });
            }

            const newUser = await User.create({
                Email: email,
                FullName: fullName,
                clerkUserId: clerkUserId, // Using consistent field name
                ProfileImage: userData.image_url || userData.profile_image_url || '',
                clerkUserName: userData.username || '',
                // Add any other fields your User model expects
            });
           
           try {
             const user = await User.findOne({ Email: email });
 
             if(user){
                 await welcomeEmail(fullName, email, "Welcome to Sri Venkateswara Agros and Herbs");
                 console.log(`sent to ${email}`)
             }
           } catch (error) {
              console.log(error)
           }
            console.log('User saved to DB with ID:', newUser._id, 'Clerk ID:', clerkUserId);
        } else if (evt.type === 'user.updated') {
            const userData = evt.data;
            const clerkUserId = userData.id; // Clerk user ID

            console.log('Updating user with Clerk ID:', clerkUserId);

            const email = userData.email_addresses?.[0]?.email_address;
            const fullName =
                [userData.first_name, userData.last_name].filter(Boolean).join(' ') ||
                'Unknown User';

            const updateData = {
                FullName: fullName,
                ProfileImage: userData.image_url || userData.profile_image_url || '',
                clerkUserName: userData.username || '',
            };

            // Only update email if it exists
            if (email) {
                updateData.Email = email;
            }

            const updatedUser = await User.findOneAndUpdate(
                { clerkUserId: clerkUserId }, // Using consistent field name
                updateData,
                { new: true },
            );

            console.log('User updated in DB:', updatedUser?._id);
        } else if (evt.type === 'user.deleted') {
            const userData = evt.data;
            const clerkUserId = userData.id; // Clerk user ID

            console.log('Deleting user with Clerk ID:', clerkUserId);

            const deletedUser = await User.findOneAndDelete({ clerkUserId: clerkUserId });
            console.log('User deleted from DB:', deletedUser?._id);
        }
    } catch (dbError) {
        console.error('Database operation failed:', dbError.message);
        return res.status(500).json({ msg: 'Database operation failed' });
    }

    return res.status(200).json({
        msg: 'Webhook processed successfully',
        eventType: evt.type,
    });
});

// Health check endpoint
webhookRouter.get('/health', (req, res) => {
    res.status(200).json({ msg: 'Webhook service is healthy' });
});