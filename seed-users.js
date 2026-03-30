const { MongoClient } = require('mongodb');
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'barbershop_db';

// Helper to hash passwords (simple for MVP)
function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

const demoUsers = [
  {
    email: 'admin@fadebook.com',
    password: hashPassword('admin123'),
    name: 'Admin User',
    phone: '+91 98765 00001',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    email: 'barber@fadebook.com',
    password: hashPassword('barber123'),
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    role: 'barber',
    barberId: 'barber_1',
    createdAt: new Date().toISOString()
  },
  {
    email: 'customer@fadebook.com',
    password: hashPassword('customer123'),
    name: 'John Doe',
    phone: '+91 98765 99999',
    role: 'customer',
    createdAt: new Date().toISOString()
  }
];

async function seedUsers() {
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    // Clear existing users
    await db.collection('users').deleteMany({});

    // Insert demo users
    await db.collection('users').insertMany(demoUsers);
    console.log(`✓ Inserted ${demoUsers.length} demo users`);
    
    console.log('\n=== Demo User Credentials ===');
    console.log('Admin: admin@fadebook.com / admin123');
    console.log('Barber: barber@fadebook.com / barber123');
    console.log('Customer: customer@fadebook.com / customer123');
    console.log('=============================\n');

    console.log('✓ Users seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

seedUsers();
