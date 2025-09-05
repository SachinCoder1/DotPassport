import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Declare the server variable in the outer scope
let mongoServer: MongoMemoryServer;

/**
 * Runs once before all tests start.
 * It's responsible for starting up a fresh, in-memory MongoDB
 * database instance that the tests will connect to.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

/**
 * Runs once after all tests have finished.
 * Its job is to clean up by disconnecting from the database
 * and stopping the in-memory server instance to free up resources.
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

/**
 * Runs before EACH individual test case (each "it" block).
 * This is the most important part for test isolation. It loops through
 * all collections in the database and deletes every document, ensuring
 * that one test cannot be affected by the data left over from a previous test.
 */
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});