const request = require("supertest");
const app = require("../index");

describe("Auth Endpoints", () => {
  let token;

  const testUser = {
    name: "Test User",
    email: "testuser@example.com",
    password: "Password123",
  };

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", testUser.email);
    token = res.body.token; // save token for protected routes
  });

  it("should not register user with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test2@example.com" });
    expect(res.statusCode).toEqual(400); // Bad Request
  });

  it("should login an existing user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  it("should get user profile with token", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty("email", testUser.email);
  });

  it("should fail profile fetching without token", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.statusCode).toEqual(401);
  });

  it("should change password with correct old password", async () => {
    const res = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: testUser.password,
        newPassword: "NewPassword123",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Password changed successfully");
  });
});
