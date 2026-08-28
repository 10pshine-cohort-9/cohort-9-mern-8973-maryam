const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app");

const createUser = async (email) => {
  const res = await request(app)
    .post("/api/auth/signup")
    .send({ name: "Note Tester", email, password: "test1234" });
  return res.body.data.token;
};

describe("Notes API", () => {
  let token;

  beforeEach(async () => {
    token = await createUser(`notes-${Date.now()}@example.com`);
  });

  it("should reject creating a note without a token", async () => {
    const res = await request(app).post("/api/notes").send({ title: "No auth" });
    expect(res.status).to.equal(401);
  });

  it("should create a note when authenticated", async () => {
    const res = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My note", content: "hello" });

    expect(res.status).to.equal(201);
    expect(res.body.data.note.title).to.equal("My note");
  });

  it("should list only the logged-in user's notes", async () => {
    await request(app).post("/api/notes").set("Authorization", `Bearer ${token}`).send({ title: "Note 1" });
    await request(app).post("/api/notes").set("Authorization", `Bearer ${token}`).send({ title: "Note 2" });

    const res = await request(app).get("/api/notes").set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.notes).to.have.lengthOf(2);
  });

  it("should update a note", async () => {
    const createRes = await request(app).post("/api/notes").set("Authorization", `Bearer ${token}`).send({ title: "Original" });
    const noteId = createRes.body.data.note._id;

    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated" });

    expect(res.status).to.equal(200);
    expect(res.body.data.note.title).to.equal("Updated");
  });

  it("should delete a note", async () => {
    const createRes = await request(app).post("/api/notes").set("Authorization", `Bearer ${token}`).send({ title: "To delete" });
    const noteId = createRes.body.data.note._id;

    const res = await request(app).delete(`/api/notes/${noteId}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
  });

  it("should return 400 for an invalid note ID format", async () => {
    const res = await request(app).get("/api/notes/not-a-valid-id").set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(400);
  });

  it("should NOT let one user access another user's note (ownership check)", async () => {
    const createRes = await request(app).post("/api/notes").set("Authorization", `Bearer ${token}`).send({ title: "User A's note" });
    const noteId = createRes.body.data.note._id;

    const otherUserToken = await createUser(`other-${Date.now()}@example.com`);

    const res = await request(app).get(`/api/notes/${noteId}`).set("Authorization", `Bearer ${otherUserToken}`);
    expect(res.status).to.equal(404);
  });
});