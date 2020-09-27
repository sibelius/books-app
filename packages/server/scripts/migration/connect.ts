/* eslint-disable import/no-extraneous-dependencies */

// this is the client used by mongoose, so we have it.
// import { MongoClient } from 'mongodb';

import { Signale } from 'signale';

import connectMongoose from './connectMongoose';

export default async function connect(logger: Signale, url: string) {
  logger.await('connecting to database');

  try {
    // const client = await MongoClient.connect(url);
    // const db = client.db();
    const db = await connectMongoose(url);
    logger.success('connecting to database');

    return db;
  } catch (error) {
    logger.fatal(error);
    process.exit(1);
  }
}
