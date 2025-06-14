export default defineEventHandler(async (event) => {
  return {
    message: 'Server is running',
    timestamp: new Date().toISOString()}
});