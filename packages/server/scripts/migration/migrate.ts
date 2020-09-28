/* eslint-disable import/no-dynamic-require */
import 'isomorphic-fetch';

import fs from 'fs';
import { join } from 'path';

import moment from 'moment';
import mongoose from 'mongoose';
import { Signale } from 'signale';

import { MONGO_URI } from '../../src/common/config';

import connect from './connect';
import delay from './delay';

const COLLECTION_NAME = 'MigrationInfo';
const DELAY_LOGS = 500;
const MIGRATIONS_DIR = join(__dirname, '..', 'migrations');
const EXCLUDED_FILES = ['__tests__', 'old'];

const m = (f: string) => join(MIGRATIONS_DIR, f);

const logger = new Signale({ interactive: true, scope: 'migrating' });

function getInfoFromMigrationFilename(fileName: string) {
  const pieces = fileName.split('-');
  const date = moment.utc(pieces[0], 'YYYYMMDDHHmmss');
  const name = pieces.slice(1).join('-').split('.')[0];
  const fullPath = m(fileName);

  return {
    date,
    name,
    fullPath,
  };
}

async function executeMigrations(migrations, collection) {
  const totalMigrations = migrations.length;
  logger.info('preparing to run all %d migrations', totalMigrations);
  await delay(DELAY_LOGS);

  let i = 0;

  for (const migrationFile of migrations) {
    ++i;
    const { date, name, fullPath } = getInfoFromMigrationFilename(migrationFile);

    logger.await('[%d/%d] - running migration %s', i, totalMigrations, name);
    await delay(200);

    const migration = require(fullPath);

    if (!migration || !migration.default) {
      throw Error(`Cannot run migration ${name} because it does not have a default export`);
    }
    const loggerMigration = new Signale({ scope: name });
    const now = moment();
    try {
      await migration.default(loggerMigration);
    } catch (err) {
      loggerMigration.fatal('Error while running %s migration', name);
      throw err;
    }

    await collection.insertOne({
      name,
      timestamp: date.unix(),
      createdAt: date.toISOString(),
      startedAt: now.toISOString(),
      finishedAt: moment().toISOString(),
    });

    logger.success('[%d/%d] - running migration %s', i, totalMigrations, name);
    await delay(200);
  }

  logger.success('ran all migrations');
  await delay(DELAY_LOGS);
}

async function run() {
  // connect to db
  const db = await connect(logger, MONGO_URI);

  logger.await('retrieving migration files');
  await delay(DELAY_LOGS);

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((file) => !EXCLUDED_FILES.includes(file));
  logger.success('retrieving migration files');

  logger.await('find latest ran migration');

  const collection = db.collection(COLLECTION_NAME);

  const latestRanMigration = await collection
    .find({})
    .sort([['timestamp', -1]])
    .limit(1)
    .toArray();

  if (latestRanMigration && latestRanMigration.length) {
    // run only remaining migrations
    const latestMigrationInfo = latestRanMigration[0];
    logger.info('verifying if all migrations were already run');
    delay(DELAY_LOGS);

    const migrations = files.filter((migration) => {
      const { name, date } = getInfoFromMigrationFilename(migration);

      return latestMigrationInfo.name !== name && date.isSameOrAfter(latestMigrationInfo.createdAt);
    });

    if (!migrations.length) {
      logger.success('you are running the latest migrations!');
      await delay(DELAY_LOGS);
    } else {
      logger.info('new migrations found');
      await delay(DELAY_LOGS);
      await executeMigrations(migrations, collection);
    }
  } else {
    // run all migrations
    logger.info('no previous migration ran');
    await delay(DELAY_LOGS);
    await executeMigrations(files, collection);
  }
}

run()
  .then(() => mongoose.disconnect())
  .catch((err) => {
    logger.fatal(err);
    mongoose.disconnect();
  });
