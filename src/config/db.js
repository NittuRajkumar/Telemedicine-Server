import mongoose from 'mongoose';

const REQUIRED_COLLECTIONS = ['users', 'appointments', 'medicalrecords', 'prescriptions'];

const connectDB = async () => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const mongoUri = process.env.MONGO_URI || (!isProduction ? 'mongodb://127.0.0.1:27017/telemedicine_db' : '');

    if (!mongoUri) {
      throw new Error('MONGO_URI is required in production. Add it in Render Environment Variables.');
    }

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

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
