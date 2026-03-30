import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://user:pass@cluster0.../PetMate2";

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    const pets = db.collection('pets');
    const badDocs = await pets.find({
      $or: [
        { 'compatibility.goodWithKids': { $type: 'bool' } },
        { 'compatibility.goodWithPets': { $type: 'bool' } },
      ]
    }).toArray();
    
    console.log(`Found ${badDocs.length} bad docs`);
    if (badDocs.length > 0) {
      console.log('Values:', badDocs.map(d => ({ 
        id: d._id, 
        kids: d.compatibility.goodWithKids, 
        pets: d.compatibility.goodWithPets 
      })));
    }
  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

check();
