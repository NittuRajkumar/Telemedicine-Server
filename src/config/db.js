import mongoose from 'mongoose';

const REQUIRED_COLLECTIONS = ['users', 'appointments', 'medicalrecords', 'prescriptions'];

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/telemedicine_db';
    await mongoose.connect(mongoUri);

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
    process.exit(1);
  }
};

export default connectDB;
