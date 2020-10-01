import DataLoader from 'dataloader';
import { connectionFromMongoAggregate, mongooseLoader } from '@entria/graphql-mongoose-loader';
import { ConnectionArguments } from 'graphql-relay';
import { Types } from 'mongoose';

import { GraphQLContext, DataLoaderKey } from '../../types';

import { NullConnection } from '../../graphql/connection/NullConnection';
import { buildMongoConditionsFromFilters } from '../../core/graphql/graphqlFilters';

import ReadingModel, { IReading } from './ReadingModel';
import { ReadingsArgFilters, readingFilterMapping } from './filters/ReadingFiltersInputType';

export default class Reading {
  public registeredType = 'Reading';

  id: string;
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  readPages: number;
  isActive: boolean;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IReading) {
    this.id = data.id || data._id;
    this._id = data._id;
    this.userId = data.userId;
    this.bookId = data.bookId;
    this.readPages = data.readPages;
    this.isActive = data.isActive;
    this.removedAt = data.removedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export const getLoader = () => new DataLoader((ids) => mongooseLoader(ReadingModel, ids));

const viewerCanSee = (context: GraphQLContext, data: IReading) => {
  if (!context.user || !context.user._id.equals(data.userId)) {
    return false;
  }

  if (!data.isActive || data.removedAt) {
    return false;
  }

  return true;
};

export const load = async (context: GraphQLContext, id: DataLoaderKey) => {
  if (!id) return null;

  try {
    const data = await context.dataloaders.ReadingLoader.load(id);

    if (!data) return null;

    return viewerCanSee(context, data) ? new Reading(data) : null;
  } catch (err) {
    return null;
  }
};

export const clearCache = ({ dataloaders }: GraphQLContext, id: string) =>
  dataloaders.ReadingLoader.clear(id.toString());

export const primeCache = ({ dataloaders }: GraphQLContext, id: string, data: IReading) =>
  dataloaders.ReadingLoader?.prime(id.toString(), data);

export const clearAndPrimeCache = (context: GraphQLContext, id: string, data: IReading) =>
  clearCache(context, id) && primeCache(context, id, data);

interface LoadReadingsArgs extends ConnectionArguments {
  filters?: ReadingsArgFilters;
}
export const loadReadings = async (context: GraphQLContext, args: LoadReadingsArgs) => {
  const { user } = context;

  if (!user) {
    return NullConnection;
  }

  const { filters = {} } = args;

  const defaultFilters = { orderBy: [{ sort: 'createdAt', direction: -1 }] };
  const defaultConditions = { userId: user._id };

  const builtMongoConditions = buildMongoConditionsFromFilters(
    context,
    { ...defaultFilters, ...filters },
    readingFilterMapping,
  );

  const conditions = {
    ...defaultConditions,
    ...builtMongoConditions.conditions,
  };

  const aggregatePipeline = [{ $match: conditions }, ...builtMongoConditions.pipeline];

  const aggregate = ReadingModel.aggregate(aggregatePipeline);

  return connectionFromMongoAggregate({
    aggregate,
    context,
    args,
    loader: load,
  });
};
