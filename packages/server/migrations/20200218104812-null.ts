import { Signale } from 'signale';

import connect from '../scripts/migration/connect';
import { MONGO_URI } from '../src/common/config';

// null
const migrate = async (logger: Signale) => {
  // Nothing to do here
  // eslint-disable-next-line no-console
  console.log('Nothing to migrate');
};

export default migrate;

(async () => {
  if (require.main === module) {
    const logger = new Signale({ interactive: false, scope: 'migrating' });

    await connect(logger, MONGO_URI);

    try {
      await migrate(logger);

      logger.success('migration finished');
    } catch (err) {
      logger.fatal(err);
      process.exit(1);
    }

    process.exit(0);
  }
})();
