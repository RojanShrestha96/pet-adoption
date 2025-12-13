
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Shelter from '../models/Shelter.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config(); // Try default first, usually looks in cwd
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.join(process.cwd(), '.env') });
}

const seedShelters = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if shelters exist
    const count = await Shelter.countDocuments();
    if (count >= 2) {
      console.log('Shelters already exist, skipping seed.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const shelters = [
      {
        name: 'Happy Paws Shelter',
        email: 'contact@happypaws.com',
        password: hashedPassword,
        phone: '1234567890',
        address: '123 Pet Lane',
        city: 'Pet City',
        state: 'CA',
        zipCode: '90001',
        description: 'A loving home for pets.',
        totalPets: 15,
        adoptionsSheltered: 42,
        location: {
            lat: 27.7172,
            lng: 85.3240,
            formattedAddress: 'Kathmandu, Nepal'
        }
      },
      {
        name: 'Second Chance Rescue',
        email: 'info@secondchance.org',
        password: hashedPassword,
        phone: '0987654321',
        address: '456 Rescue Rd',
        city: 'Save Town',
        state: 'NY',
        zipCode: '10001',
        description: 'Giving pets a second chance.',
        totalPets: 8,
        adoptionsSheltered: 120,
        location: {
             lat: 27.6710, 
             lng: 85.3226,
             formattedAddress: 'Lalitpur, Nepal'
        }
      }
    ];

    await Shelter.insertMany(shelters);
    console.log('Seeded 2 shelters successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedShelters();
