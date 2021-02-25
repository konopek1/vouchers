export default {
    origin: [
      process.env.USER_APP_URL,
      process.env.ADMIN_APP_URL
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"],
};