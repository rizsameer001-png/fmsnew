const mongoose = require('mongoose');
const Building = require('../models/Building.model');
const { logger } = require('../utils/logger');
require('dotenv').config();

const seedBuildings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB for building seeding');
    
    const buildings = [
      {
        name: 'Corporate Tower A',
        code: 'CTA01',
        address: {
          street: '123 Business District',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pincode: '400001',
          latitude: 19.0760,
          longitude: 72.8777
        },
        totalFloors: 20,
        totalArea: 50000,
        status: 'active'
      },
      {
        name: 'Tech Park',
        code: 'TPK02',
        address: {
          street: '456 IT Corridor',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          pincode: '560001',
          latitude: 12.9716,
          longitude: 77.5946
        },
        totalFloors: 15,
        totalArea: 75000,
        status: 'active'
      },
      {
        name: 'Business Hub',
        code: 'BHB03',
        address: {
          street: '789 Commercial Complex',
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          pincode: '110001',
          latitude: 28.7041,
          longitude: 77.1025
        },
        totalFloors: 10,
        totalArea: 35000,
        status: 'active'
      },
    ];
    
    let created = 0;
    
    for (const building of buildings) {
      const exists = await Building.findOne({ code: building.code });
      if (!exists) {
        await Building.create(building);
        logger.info(`✅ Created building: ${building.name}`);
        created++;
      } else {
        logger.info(`⚠️ Building already exists: ${building.name}`);
      }
    }
    
    console.log(`\n✅ Buildings seeding completed: ${created} created`);
    process.exit(0);
  } catch (error) {
    logger.error('Buildings seeding failed:', error.message);
    process.exit(1);
  }
};

seedBuildings();