import app from './server.js';
import logger from './utils/logger';
import './utils/envConfig';
import './utils/passport';
import './utils/db';

app.listen(process.env.PORT, err => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }

  logger.info(`app is now running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});
