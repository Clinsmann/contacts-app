
import path from 'path';
import dotenv from 'dotenv';
import app from './server.js';
import logger from './utils/logger';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import './utils/db';

app.listen(process.env.PORT, err => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }

  logger.info(`app is now running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});
