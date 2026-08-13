export const AppConfig = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
});
