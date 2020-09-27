import DataLoader from 'dataloader';
import { connectionFromMongoAggregate, mongooseLoader } from '@entria/graphql-mongoose-loader';
import { ConnectionArguments } from 'graphql-relay';
import { Types } from 'mongoose';

import { GraphQLContext, DataLoaderKey } from '../../types';

import { NullConnection } from '../../graphql/connection/NullConnection';

import { buildMongoConditionsFromFilters } from '../../core/graphql/graphqlFilters';

import BookModel, { IBook } from './BookModel';
import { BookArgFilters, bookFilterMapping } from './filters/BookFiltersInputType';

export default class Book {
  public registeredType = 'Book';

  id: string;
  _id: Types.ObjectId;
  name: string;
  author: string;
  description: string;
  releaseYear: number;
  pages: number;
  price: number;
  bannerUrl: string;
  ISBN?: number;
  language?: string;
  isActive: boolean;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IBook) {
    this.id = data.id || data._id;
    this._id = data._id;
    this.name = data.name;
    this.author = data.author;
    this.description = data.description;
    this.releaseYear = data.releaseYear;
    this.pages = data.pages;
    this.price = data.price;
    this.bannerUrl = data.bannerUrl;
    this.ISBN = data.ISBN;
    this.language = data.language;
    this.isActive = data.isActive;
    this.removedAt = data.removedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export const getLoader = () => new DataLoader((ids) => mongooseLoader(BookModel, ids));

const viewerCanSee = (context: GraphQLContext, data: IBook) => {
  if (!context.user) {
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
    const data = await context.dataloaders.BookLoader.load(id);

    if (!data) return null;

    return viewerCanSee(context, data) ? new Book(data) : null;
  } catch (err) {
    return null;
  }
};

export const clearCache = ({ dataloaders }: GraphQLContext, id: string) => dataloaders.BookLoader.clear(id.toString());

export const primeCache = ({ dataloaders }: GraphQLContext, id: string, data: IBook) =>
  dataloaders.BookLoader?.prime(id.toString(), data);

export const clearAndPrimeCache = (context: GraphQLContext, id: string, data: IBook) =>
  clearCache(context, id) && primeCache(context, id, data);

interface IloadBookssArgs extends ConnectionArguments {
  filters?: BookArgFilters;
}
export const loadBooks = async (context: GraphQLContext, args: IloadBookssArgs) => {
  const { user } = context;
  const { filters = {} } = args;

  if (!user) {
    return NullConnection;
  }

  const defaultFilters = { orderBy: [{ sort: 'createdAt', direction: -1 }] };
  const defaultConditions = {};

  const builtMongoConditions = buildMongoConditionsFromFilters(
    context,
    { ...defaultFilters, ...filters },
    bookFilterMapping,
  );

  const conditions = {
    ...defaultConditions,
    ...builtMongoConditions.conditions,
  };

  const aggregatePipeline = [{ $match: conditions }, ...builtMongoConditions.pipeline];

  const aggregate = BookModel.aggregate(aggregatePipeline);

  return connectionFromMongoAggregate({
    aggregate,
    context,
    args,
    loader: load,
  });
};
