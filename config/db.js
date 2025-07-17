import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongo_uri = process.env.MONGODB_URI;

if (!mongo_uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        console.log('Using cached MongoDB connection');
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose
            .connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(mongoose => mongoose)
            .catch(error => {
                console.error('MongoDB connection error:', error);
                throw error;
            });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export { connectToDatabase };
