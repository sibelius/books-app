import mongoose, { Document, Model } from 'mongoose';

import { isActiveMongooseField, removedAtMongooseField } from '../../core/mongoose/withMongooseFields';

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      description: 'The book name. ex: O Alienista',
      required: true,
    },
    author: {
      type: String,
      description: 'The book author. ex: Machado de Assis',
      required: true,
    },
    description: {
      type: String,
      description: 'The book description.',
      required: true,
    },
    releaseYear: {
      type: Number,
      description: 'The book release year. ex: 1882',
      //required: true,
    },
    pages: {
      type: Number,
      description: 'The book total page. ex: 96',
      required: true,
    },
    price: {
      type: Number,
      description: 'The book price. ex: 20',
      required: true,
    },
    bannerUrl: {
      type: String,
      description: 'The book banner url.',
      required: true,
    },
    ISBN: {
      type: Number,
      description: 'The book banner ISBN. ex: 9780850515060',
      //required: true,
    },
    language: {
      type: String,
      description: 'The book language. ex: Portuguese',
    },
    ...isActiveMongooseField,
    ...removedAtMongooseField,
  },
  {
    collection: 'Book',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

Schema.index({ name: 1, author: 1, description: 1 });

export interface IBook extends Document {
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
}

const BookModel: Model<IBook> = mongoose.model('Book', Schema);

export default BookModel;
