const mongoose = require('mongoose');
const Service = require('../models/Service.model');
const { logger } = require('../utils/logger');
require('dotenv').config();

const seedServices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB for services seeding');
    
    // First, clear existing services (optional - remove if you want to keep existing)
    // await Service.deleteMany({});
    // logger.info('Cleared existing services');
    
    const services = [
      { 
        name: 'Cleaning Service', 
        category: 'cleaning', 
        description: 'Professional cleaning services including floor cleaning, dusting, and sanitization', 
        basePrice: 500, 
        gstRate: 18, 
        slaResponseTime: 24, 
        slaResolutionTime: 48, 
        isActive: true 
      },
      { 
        name: 'Electrical Service', 
        category: 'electrical', 
        description: 'Electrical repairs, wiring, fixture installation, and maintenance', 
        basePrice: 750, 
        gstRate: 18, 
        slaResponseTime: 12, 
        slaResolutionTime: 24, 
        isActive: true 
      },
      { 
        name: 'Plumbing Service', 
        category: 'plumbing', 
        description: 'Plumbing repairs, pipe installation, leakage fixes, and drainage', 
        basePrice: 650, 
        gstRate: 18, 
        slaResponseTime: 12, 
        slaResolutionTime: 24, 
        isActive: true 
      },
      { 
        name: 'Security Service', 
        category: 'security', 
        description: 'Security personnel, CCTV monitoring, and access control', 
        basePrice: 1000, 
        gstRate: 18, 
        slaResponseTime: 1, 
        slaResolutionTime: 4, 
        isActive: true 
      },
      { 
        name: 'Waste Management', 
        category: 'waste_management', 
        description: 'Waste collection, segregation, and disposal services', 
        basePrice: 400, 
        gstRate: 18, 
        slaResponseTime: 24, 
        slaResolutionTime: 48, 
        isActive: true 
      },
      { 
        name: 'Landscaping', 
        category: 'landscaping', 
        description: 'Garden maintenance, lawn care, and plantation services', 
        basePrice: 600, 
        gstRate: 18, 
        slaResponseTime: 48, 
        slaResolutionTime: 72, 
        isActive: true 
      },
      { 
        name: 'Catering Service', 
        category: 'catering', 
        description: 'Food and beverage services for events and daily operations', 
        basePrice: 1200, 
        gstRate: 18, 
        slaResponseTime: 4, 
        slaResolutionTime: 24, 
        isActive: true 
      },
      { 
        name: 'HVAC Maintenance', 
        category: 'hvac', 
        description: 'AC repair, ventilation, and heating system maintenance', 
        basePrice: 900, 
        gstRate: 18, 
        slaResponseTime: 6, 
        slaResolutionTime: 24, 
        isActive: true 
      },
      { 
        name: 'Pest Control', 
        category: 'cleaning', 
        description: 'Pest control and fumigation services', 
        basePrice: 800, 
        gstRate: 18, 
        slaResponseTime: 48, 
        slaResolutionTime: 72, 
        isActive: true 
      },
      { 
        name: 'Reception Service', 
        category: 'reception', 
        description: 'Front desk and reception management services', 
        basePrice: 700, 
        gstRate: 18, 
        slaResponseTime: 2, 
        slaResolutionTime: 8, 
        isActive: true 
      },
      { 
        name: 'Hospitality Service', 
        category: 'hospitality', 
        description: 'Guest services, event management, and hospitality support', 
        basePrice: 1500, 
        gstRate: 18, 
        slaResponseTime: 4, 
        slaResolutionTime: 24, 
        isActive: true 
      }
    ];
    
    let created = 0;
    let skipped = 0;
    
    for (const service of services) {
      try {
        const exists = await Service.findOne({ name: service.name });
        if (!exists) {
          await Service.create(service);
          logger.info(`✅ Created service: ${service.name}`);
          created++;
        } else {
          logger.info(`⚠️ Service already exists: ${service.name}`);
          skipped++;
        }
      } catch (err) {
        logger.error(`❌ Failed to create service ${service.name}:`, err.message);
      }
    }
    
    console.log('\n=================================');
    console.log(`✅ Services seeding completed: ${created} created, ${skipped} skipped`);
    console.log('Valid categories: cleaning, security, waste_management, plumbing, electrical, landscaping, catering, hospitality, reception, hvac');
    console.log('=================================\n');
    
    process.exit(0);
  } catch (error) {
    logger.error('Services seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedServices();