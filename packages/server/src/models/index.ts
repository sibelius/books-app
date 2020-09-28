import mongoose from 'mongoose';

import User, { IUser } from '../modules/user/UserModel';
import SessionToken, { ISessionToken, SESSION_TOKEN_SCOPES } from '../modules/sessionToken/SessionTokenModel';
import Book, { IBook } from '../modules/book/BookModel';
import Review, { IReview } from '../modules/review/ReviewModel';

mongoose.Promise = global.Promise;

export { User, IUser, SessionToken, ISessionToken, SESSION_TOKEN_SCOPES, Book, IBook, Review, IReview };
