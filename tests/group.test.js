const request = require("supertest");
const app = require("../index");

describe("Group Endpoints", () => {
  let token;
  let testGroup;

  const testUser = {
    name: "Group Tester",
    email: "grouptester@example.com",
    password: "Password123",
  };

  beforeAll(async () => {
    // Register test user
    const res = await request(app).post("/api/auth/register").send(testUser);
    token = res.body.token;
  });

  it("should fail to create group with missing fields", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ groupName: "Missing Fields Group" });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it("should create a new group", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({
        groupName: "Test Group",
        groupLink: "https://chat.whatsapp.com/testlink",
        description: "This is a test group",
        category: "Tech",
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.group).toHaveProperty("groupName", "Test Group");
    testGroup = res.body.group;
  });

  it("should get all groups", async () => {
    const res = await request(app).get("/api/groups");
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    // At least one group exists
    expect(res.body.groups.length).toBeGreaterThanOrEqual(1); 
  });

  it("should get a single group by id", async () => {
    const res = await request(app).get(`/api/groups/${testGroup._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.group._id).toEqual(testGroup._id);
  });

  it("should get user's own groups", async () => {
    const res = await request(app)
      .get("/api/groups/my-groups")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.groups.length).toBeGreaterThanOrEqual(1);
    expect(res.body.groups[0]._id).toEqual(testGroup._id);
  });

  it("should toggle like on a group", async () => {
    const res = await request(app)
      .post(`/api/groups/${testGroup._id}/like`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isLiked).toBe(true);
  });

  it("should update a group", async () => {
    const res = await request(app)
      .put(`/api/groups/${testGroup._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        groupName: "Updated Test Group",
        groupLink: testGroup.groupLink,
        description: testGroup.description,
        category: testGroup.category,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.group.groupName).toBe("Updated Test Group");
  });

  it("should fail to delete group unauthenticated", async () => {
    const res = await request(app).delete(`/api/groups/${testGroup._id}`);
    expect(res.statusCode).toEqual(401);
  });

  it("should delete a group", async () => {
    const res = await request(app)
      .delete(`/api/groups/${testGroup._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    
    // Check if actually deleted
    const getRes = await request(app).get(`/api/groups/${testGroup._id}`);
    expect(getRes.statusCode).toEqual(404);
  });
});
