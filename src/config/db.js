import mongoose from 'mongoose';

const REQUIRED_COLLECTIONS = ['users', 'appointments', 'medicalrecords', 'prescriptions'];

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing. Set it in your .env locally and in Render Environment Variables.');
    }

    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

    const db = mongoose.connection.db;
    const existingCollections = await db.listCollections().toArray();
    const existingCollectionNames = new Set(existingCollections.map((collection) => collection.name));

    for (const collectionName of REQUIRED_COLLECTIONS) {
      if (!existingCollectionNames.has(collectionName)) {
        await db.createCollection(collectionName);
      }
    }

    console.log('MongoDB connected');
    console.log('Required collections are ready:', REQUIRED_COLLECTIONS.join(', '));
  } catch (error) {
    console.error('MongoDB connection error:', error.message);

    if (error.message.includes('ECONNREFUSED 127.0.0.1:27017')) {
      console.error('Hint: Render cannot use local MongoDB. Set MONGO_URI to your MongoDB Atlas URI in Render env vars.');
    }

    process.exit(1);
  }
};

export default connectDB;
