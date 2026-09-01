import { PrismaClient, BookingStatus, MechanicStatus, PriorityLevel } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Service catalog definition
const SERVICE_CATALOG = [
  { name: 'Full Synthetic Oil Change', category: 'Maintenance', basePrice: 89.99, estimatedDuration: 45, description: 'Engine oil flush & replacement with synthetic grade, oil filter change, and 20-point inspection.' },
  { name: 'Front & Rear Brake Pad Replacement', category: 'Brakes', basePrice: 249.50, estimatedDuration: 90, description: 'Ceramic brake pad swap, rotor inspection, and fluid top-up.' },
  { name: '12V Battery Health Diagnostic & Replacement', category: 'Electrical', basePrice: 179.00, estimatedDuration: 30, description: 'Battery load testing, terminal cleaning, and OEM spec battery installation.' },
  { name: '4-Wheel Tire Rotation & Computer Balancing', category: 'Tires & Wheels', basePrice: 65.00, estimatedDuration: 45, description: 'Tire rotation, computer wheel balancing, and tire pressure sensor calibration.' },
  { name: 'Comprehensive OBD-II Diagnostic Scan', category: 'Diagnostics', basePrice: 110.00, estimatedDuration: 45, description: 'Full engine error code scanning, sensor health telemetry, and technician diagnosis.' },
  { name: 'Air Conditioning System Recharge & Leak Check', category: 'Climate Control', basePrice: 195.00, estimatedDuration: 60, description: 'R134a/R1234yf refrigerant vacuum recharge and UV dye leak detection.' },
  { name: 'Suspension Strut & Shock Absorber Replacement', category: 'Suspension', basePrice: 420.00, estimatedDuration: 120, description: 'Front/rear suspension struts replacement and ride height alignment check.' },
  { name: 'Automatic Transmission Fluid Flush', category: 'Transmission', basePrice: 280.00, estimatedDuration: 75, description: 'Complete transmission fluid evacuation, filter replacement, and fluid pan reseal.' },
  { name: 'Iridium Spark Plugs & Ignition Coil Pack Swap', category: 'Engine', basePrice: 210.00, estimatedDuration: 60, description: 'Spark plug replacement and ignition coil pack inspection for misfire prevention.' },
  { name: 'Cooling System Flush & Radiator Hose Check', category: 'Maintenance', basePrice: 145.00, estimatedDuration: 60, description: 'Coolant drain, chemical flush, pressure test, and 50/50 OAT coolant refill.' },
  { name: 'High-Performance Cabin & Engine Air Filters', category: 'Maintenance', basePrice: 55.00, estimatedDuration: 20, description: 'HEPA cabin air filter and engine intake air filter replacement.' },
  { name: 'Electric Vehicle (EV) High-Voltage Health Check', category: 'EV / Hybrid', basePrice: 230.00, estimatedDuration: 90, description: 'Thermal cooling loop test, cell balance telemetry, and insulation resistance check.' },
];

const VEHICLE_MAKES_MODELS = [
  { make: 'Toyota', models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Prius'] },
  { make: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V'] },
  { make: 'Ford', models: ['F-150', 'Explorer', 'Mustang', 'Escape', 'Bronco'] },
  { make: 'Tesla', models: ['Model 3', 'Model Y', 'Model S', 'Model X'] },
  { make: 'BMW', models: ['330i', '540i', 'X3', 'X5', 'M340i'] },
  { make: 'Chevrolet', models: ['Silverado 1500', 'Equinox', 'Tahoe', 'Malibu'] },
  { make: 'Hyundai', models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Ioniq 5'] },
  { make: 'Subaru', models: ['Outback', 'Forester', 'Crosstrek', 'WRX'] },
  { make: 'Mercedes-Benz', models: ['C300', 'E350', 'GLC 300', 'GLE 450'] },
  { make: 'Nissan', models: ['Altima', 'Rogue', 'Sentra', 'Frontier'] },
];

// Centered around San Francisco Bay Area / Metro Ops Area for realism
const BASE_LAT = 37.7749;
const BASE_LNG = -122.4194;

function getRandomLocation() {
  const latOffset = (Math.random() - 0.5) * 0.15;
  const lngOffset = (Math.random() - 0.5) * 0.15;
  return {
    lat: Number((BASE_LAT + latOffset).toFixed(6)),
    lng: Number((BASE_LNG + lngOffset).toFixed(6)),
  };
}

async function main() {
  console.log('🧹 Cleaning existing records from database...');
  await prisma.bookingLog.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.serviceItem.deleteMany();
  await prisma.mechanic.deleteMany();
  await prisma.customer.deleteMany();

  console.log('🚀 Seeding Service Catalog...');
  const services = await Promise.all(
    SERVICE_CATALOG.map((svc) =>
      prisma.serviceItem.create({
        data: svc,
      })
    )
  );
  console.log(`✅ Created ${services.length} services.`);

  console.log('🚀 Seeding 25 Mechanics...');
  const specializations = [
    'Master Diagnostics & Powertrain',
    'Braking & Hydraulic Systems',
    'EV & Hybrid High-Voltage Specialist',
    'Suspension, Steering & Alignment',
    'Electrical & ECM Troubleshooting',
    'Preventative Maintenance Lead',
  ];

  const mechanicStatuses: MechanicStatus[] = [
    MechanicStatus.AVAILABLE,
    MechanicStatus.AVAILABLE,
    MechanicStatus.AVAILABLE,
    MechanicStatus.BUSY,
    MechanicStatus.BUSY,
    MechanicStatus.OFF_DUTY,
  ];

  const mechanics = [];
  for (let i = 1; i <= 25; i++) {
    const loc = getRandomLocation();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const mech = await prisma.mechanic.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: faker.phone.number(),
        specialization: faker.helpers.arrayElement(specializations),
        status: faker.helpers.arrayElement(mechanicStatuses),
        rating: Number(faker.number.float({ min: 4.2, max: 5.0, fractionDigits: 1 })),
        completedJobs: faker.number.int({ min: 15, max: 240 }),
        currentLat: loc.lat,
        currentLng: loc.lng,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      },
    });
    mechanics.push(mech);
  }
  console.log(`✅ Created ${mechanics.length} mechanics.`);

  console.log('🚀 Seeding 60 Customers...');
  const customers = [];
  for (let i = 1; i <= 60; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const cust = await prisma.customer.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: faker.phone.number(),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, CA ${faker.location.zipCode()}`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${firstName}${lastName}`,
      },
    });
    customers.push(cust);
  }
  console.log(`✅ Created ${customers.length} customers.`);

  console.log('🚀 Seeding 600+ Bookings with realistic historical and active timeline...');
  const bookingStatuses: BookingStatus[] = [
    // Realistic distribution: mostly completed past jobs, plus active in-flight jobs
    ...Array(35).fill(BookingStatus.COMPLETED),
    ...Array(8).fill(BookingStatus.IN_PROGRESS),
    ...Array(6).fill(BookingStatus.EN_ROUTE),
    ...Array(6).fill(BookingStatus.ASSIGNED),
    ...Array(5).fill(BookingStatus.PENDING),
    ...Array(3).fill(BookingStatus.CANCELLED),
  ];

  const priorities: PriorityLevel[] = [
    PriorityLevel.LOW,
    PriorityLevel.MEDIUM,
    PriorityLevel.MEDIUM,
    PriorityLevel.HIGH,
    PriorityLevel.EMERGENCY,
  ];

  const now = new Date();
  let bookingCount = 0;

  for (let i = 1; i <= 620; i++) {
    const status = faker.helpers.arrayElement(bookingStatuses);
    const service = faker.helpers.arrayElement(services);
    const customer = faker.helpers.arrayElement(customers);
    const mechanic = status === BookingStatus.PENDING ? null : faker.helpers.arrayElement(mechanics);

    const vehicleObj = faker.helpers.arrayElement(VEHICLE_MAKES_MODELS);
    const vehicleModel = faker.helpers.arrayElement(vehicleObj.models);
    const vehicleYear = faker.number.int({ min: 2014, max: 2024 });
    const licensePlate = `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`;

    // Price variation (+/- 15% labor/parts variance)
    const priceVariance = (faker.number.float({ min: 0.9, max: 1.25, fractionDigits: 2 }));
    const amount = Number((service.basePrice * priceVariance).toFixed(2));

    // Realistic timestamp generation based on status
    let createdAt: Date;
    let scheduledAt: Date;
    let completedAt: Date | null = null;

    if (status === BookingStatus.COMPLETED) {
      // Past 1 to 90 days
      const daysAgo = faker.number.int({ min: 1, max: 90 });
      createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      scheduledAt = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
      completedAt = new Date(scheduledAt.getTime() + (service.estimatedDuration + 15) * 60 * 1000);
    } else if (status === BookingStatus.CANCELLED) {
      const daysAgo = faker.number.int({ min: 1, max: 60 });
      createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      scheduledAt = new Date(createdAt.getTime() + 3 * 60 * 60 * 1000);
    } else if (status === BookingStatus.PENDING) {
      // Created within the last 1-4 hours or scheduled for today/tomorrow
      const minutesAgo = faker.number.int({ min: 10, max: 240 });
      createdAt = new Date(now.getTime() - minutesAgo * 60 * 1000);
      scheduledAt = new Date(now.getTime() + faker.number.int({ min: 30, max: 360 }) * 60 * 1000);
    } else {
      // Active in-progress, assigned, en-route today
      const hoursAgo = faker.number.int({ min: 1, max: 8 });
      createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      scheduledAt = new Date(createdAt.getTime() + 45 * 60 * 1000);
    }

    const bookingNumber = `BK-${10000 + i}`;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: customer.id,
        mechanicId: mechanic ? mechanic.id : null,
        serviceId: service.id,
        vehicleMake: vehicleObj.make,
        vehicleModel,
        vehicleYear,
        licensePlate,
        status,
        priority: faker.helpers.arrayElement(priorities),
        amount,
        customerAddress: customer.address,
        notes: faker.helpers.maybe(() => faker.hacker.phrase(), { probability: 0.4 }) || null,
        createdAt,
        scheduledAt,
        completedAt,
      },
    });

    // Create initial booking audit log
    await prisma.bookingLog.create({
      data: {
        bookingId: booking.id,
        status: BookingStatus.PENDING,
        message: `Booking #${bookingNumber} created by customer ${customer.name}.`,
        createdAt: createdAt,
      },
    });

    if (mechanic && status !== BookingStatus.PENDING) {
      await prisma.bookingLog.create({
        data: {
          bookingId: booking.id,
          status,
          message: `Booking dispatched and marked as ${status} (Assigned to ${mechanic.name}).`,
          createdAt: new Date(createdAt.getTime() + 15 * 60 * 1000),
        },
      });
    }

    bookingCount++;
  }

  console.log(`🎉 Seeding complete! Populated ${bookingCount} bookings across 60 customers, 25 mechanics, and 12 service categories.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
