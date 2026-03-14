const request = require("supertest");
const app = require("../index");
const User = require("../models/User");
const Group = require("../models/Group");

describe("Admin Endpoints", () => {
  let adminToken;
  let regularToken;
  let testUserId;
  let testPostId;

  const adminUser = {
    name: "Admin User",
    email: "admin@example.com",
    password: "Password123",
    role: "admin", // Explicitly set if allowed, else manually created
  };

  const regularUser = {
    name: "Regular User",
    email: "regular@example.com",
    password: "Password123",
  };

  beforeAll(async () => {
    // Manually register admin
    const newAdmin = new User({ ...adminUser });
    await newAdmin.save();

    const adminRes = await request(app).post("/api/auth/login").send({
      email: adminUser.email,
      password: adminUser.password,
    });
    adminToken = adminRes.body.token;

    // Register regular user
    const regularRes = await request(app).post("/api/auth/register").send(regularUser);
    regularToken = regularRes.body.token;
    testUserId = regularRes.body.user._id;

    // Create a group post by regular user
    const postRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${regularToken}`)
      .send({
        groupName: "Test Group by Regular User",
        groupLink: "https://chat.whatsapp.com/test",
        description: "This is a test group",
        category: "Tech",
      });
    testPostId = postRes.body.group?._id;
  });

  it("should fail getting users as regular user", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${regularToken}`);
    expect(res.statusCode).toEqual(403);
  });

  it("should get all users as admin", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);
  });

  it("should get all posts as admin", async () => {
    const res = await request(app)
      .get("/api/admin/posts")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.posts.length).toBeGreaterThanOrEqual(1);
  });

  it("should get site statistics as admin", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toHaveProperty("totalUsers");
    expect(res.body.stats).toHaveProperty("totalPosts");
  });

  it("should update post status as admin", async () => {
    const res = await request(app)
      .put(`/api/admin/post/${testPostId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "rejected" });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.group.status).toBe("rejected");
  });

  it("should verify a post as admin", async () => {
    const res = await request(app)
      .put(`/api/admin/post/${testPostId}/verify`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.group.isVerified).toBe(true);
  });

  it("should delete a post as admin", async () => {
    const res = await request(app)
      .delete(`/api/admin/post/${testPostId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it("should delete a regular user as admin", async () => {
    const res = await request(app)
      .delete(`/api/admin/user/${testUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});
