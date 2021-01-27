export default {
    origin: [
      process.env.FRONT_APP_URL,
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"],
};