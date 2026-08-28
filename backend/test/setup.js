const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

exports.mochaHooks = {
  async beforeAll() {
    this.timeout(30000);
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  },

  async afterEach() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  },

  async afterAll() {
    await mongoose.disconnect();
    await mongod.stop();
  },
};