import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { logger } from './logger.js';

const config = loadConfig();
const app = createApp(config);

app.listen(config.PORT, (error) => {
  if (error) throw error;
  logger.info('api.listening', { port: config.PORT, env: config.NODE_ENV });
});
