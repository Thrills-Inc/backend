import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Thrills API",
      version: "1.0.0",
      description:
        "Social Media Platform API Documentation",
    },

    servers: [
      {
        url:
        process.env.NODE_ENV === "production"
        ? "https://thrills.onrender.com/api"
        : "http://localhost:8800/api",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    "./routes/*.js",
  ],
};

const specs =
  swaggerJsdoc(options);

export default specs;






// tags: [
//   {
//     name: "Auth",
//     description: "Authentication endpoints",
//   },
//   {
//     name: "Users",
//     description: "User management endpoints",
//   },
//   {
//     name: "Posts",
//     description: "Post management endpoints",
//   },
//   {
//     name: "Comments",
//     description: "Comment endpoints",
//   },
//   {
//     name: "Likes",
//     description: "Like endpoints",
//   },
//   {
//     name: "Relationships",
//     description: "Follow/unfollow endpoints",
//   },
//   {
//     name: "Stories",
//     description: "Story endpoints",
//   },
//   {
//     name: "Messages",
//     description: "Messaging endpoints",
//   },
//   {
//     name: "Notifications",
//     description: "Notification endpoints",
//   },
//   {
//     name: "Admin",
//     description: "Administration endpoints",
//   },
//     {
//   name: "Search",
//   description: "Global platform search",
// },
//     {
//   name: "Discover",
//   description: "Content discovery and recommendations",
// },
//     {
//   name: "Reports",
//   description: "Content reporting and moderation",
// },

//     {
//   name: "Analytics",
//   description: "Platform statistics and analytics",
// },
//     {
//   name: "Audit",
//   description: "Administrative audit and compliance logs",
// },
//     {
//   name: "Block",
//   description: "User blocking and privacy controls",
// }
// ],






// tags: [
//   { name: "Auth", description: "Authentication endpoints" },
//   { name: "Users", description: "User management" },
//   { name: "Posts", description: "Post management" },
//   { name: "Comments", description: "Comment management" },
//   { name: "Likes", description: "Post likes" },
//   { name: "Relationships", description: "Follow and unfollow users" },
//   { name: "Messages", description: "Private messaging" },
//   { name: "Conversations", description: "Conversation management" },
//   { name: "Notifications", description: "User notifications" },
//   { name: "Stories", description: "Stories feature" },
//   { name: "Search", description: "Global search" },
//   { name: "Discover", description: "Recommendations and discovery" },
//   { name: "Reports", description: "Moderation reports" },
//   { name: "Admin", description: "Administrative actions" },
//   { name: "Analytics", description: "Platform analytics" },
//   { name: "Audit", description: "Audit logs" },
//   { name: "Block", description: "User blocking system" }
// ]