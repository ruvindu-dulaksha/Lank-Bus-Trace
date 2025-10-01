import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGODB_URI;
const dataPath = path.resolve('src/data/extended-sample-data.json');
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const { routes, buses, trips, users } = rawData;

async function importData() {
  await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection;

  try {
    await db.collection('routes').deleteMany({});
    await db.collection('buses').deleteMany({});
    await db.collection('trips').deleteMany({});
    await db.collection('users').deleteMany({});

    await db.collection('routes').insertMany(routes);
    await db.collection('buses').insertMany(buses);
    await db.collection('trips').insertMany(trips);
    await db.collection('users').insertMany(users);

    console.log('✅ Simulation data imported successfully!');
  } catch (err) {
    console.error('❌ Error importing data:', err);
  } finally {
    await mongoose.disconnect();
  }
}

importData();