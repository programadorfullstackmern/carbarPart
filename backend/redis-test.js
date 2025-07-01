import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

await client.connect();
console.log("¡Conectado correctamente!");
await client.quit();