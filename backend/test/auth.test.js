const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app");
const User = require("../src/models/User");

describe("Auth API", () => {
  describe("POST /api/auth/signup", () => {
    it("should create a new user with valid data", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test User", email: "test@example.com", password: "test1234" });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.equal(true);
      expect(res.body.data.token).to.be.a("string");
      expect(res.body.data.user).to.not.have.property("password");
    });

    it("should reject signup with a duplicate email", async () => {
      await request(app).post("/api/auth/signup").send({ name: "A", email: "dup@example.com", password: "test1234" });
      const res = await request(app).post("/api/auth/signup").send({ name: "B", email: "dup@example.com", password: "test1234" });

      expect(res.status).to.equal(409);
    });

    it("should reject signup with missing fields", async () => {
      const res = await request(app).post("/api/auth/signup").send({ email: "onlyemail@example.com" });
      expect(res.status).to.equal(400);
    });

    it("should store the password as a bcrypt hash, not plain text", async () => {
      await request(app).post("/api/auth/signup").send({ name: "Hash Test", email: "hash@example.com", password: "test1234" });
      const user = await User.findOne({ email: "hash@example.com" });
      expect(user.password).to.not.equal("test1234");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/signup").send({ name: "Login User", email: "login@example.com", password: "test1234" });
    });

    it("should log in with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({ email: "login@example.com", password: "test1234" });
      expect(res.status).to.equal(200);
      expect(res.body.data.token).to.be.a("string");
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({ email: "login@example.com", password: "wrongpassword" });
      expect(res.status).to.equal(401);
    });

    it("should reject login with a non-existent email", async () => {
      const res = await request(app).post("/api/auth/login").send({ email: "nope@example.com", password: "test1234" });
      expect(res.status).to.equal(401);
    });
  });
});