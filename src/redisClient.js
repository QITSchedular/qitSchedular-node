const redis = require('redis');

// Create Redis client
const client = redis.createClient({
  url: 'redis://localhost:6379',  // Use the correct Redis URL, including port if needed
});

client.connect().then(() => {
  console.log('Connected to Redis');
}).catch(err => {
  console.error('Error connecting to Redis:', err);
});

module.exports = client;
