/* eslint-disable no-console */
import 'isomorphic-fetch';

import { koaPlayground } from 'graphql-playground-middleware';
import { print } from 'graphql/language';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import convert from 'koa-convert';
import cors from '@koa/cors';
import graphqlHttp, { OptionsData } from 'koa-graphql';
import koaLogger from 'koa-logger';
import multer from 'koa-multer';
import Router from '@koa/router';
import idx from 'idx';
import i18next from 'i18next';
import koaI18next from 'koa-i18next';
import NoIntrospection from 'graphql-disable-introspection';

import * as graphqlLoaders from '../loader';

import { JWT_KEY, DEBUG_GRAPHQL } from '../common/config';

import { GraphQLContext, KoaContextExt } from '../types';

import UserModel, { IUser } from '../modules/user/UserModel';

import { t } from '../locales/helpers';

import appPlatformMiddleware from '../modules/auth/appPlatformMiddleware';
import authMiddleware from '../modules/auth/authMiddleware';

import { getDataloaders, hasIntrospectionQuery } from './helper';
import { schema } from './schema';
import { i18nMiddleware } from './i18n';

const app = new Koa<any, KoaContextExt>();
// https://github.com/koajs/koa/blob/422e539e8989e65ba43ecc39ddbaa3c4f755d465/docs/api/request.md#requestip
if (process.env.NODE_ENV === 'production') {
  app.proxy = true;
}
app.keys = [JWT_KEY];

const loaders = graphqlLoaders;

const router = new Router<any, KoaContextExt>();
const storage = multer.memoryStorage();

// https://github.com/expressjs/multer#limits
const limits = {
  // Increasing max upload size to 30 mb, since busboy default is only 1 mb
  fieldSize: 30 * 1024 * 1024,
};

app.use(bodyParser());

// https://github.com/koajs/koa/wiki/Error-Handling
// When using `koa-graphql` this is not really called, but let's keep in in here
// for future reference
// see https://github.com/chentsulin/koa-graphql/issues/85
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log('koa error:', err);
    ctx.status = err.status || 500;
    ctx.app.emit('error', err, ctx);
  }
});

app.on('error', (error) => {
  console.error('Error while answering request', { error });
});

if (process.env.NODE_ENV !== 'test') {
  app.use(koaLogger());
}

app.use(convert(cors({ maxAge: 86400, origin: '*' })));

router.get('/healthz', async (ctx) => {
  try {
    await UserModel.find().lean<IUser>();
    ctx.body = 'Database working';
    ctx.status = 200;
  } catch (err) {
    ctx.body = err.toString();
    ctx.status = 500;
  }
});

router.all('/graphql', multer({ storage, limits }).any());

if (process.env.NODE_ENV !== 'production') {
  router.all(
    '/playground',
    koaPlayground({
      endpoint: '/graphql',
    }),
  );
}

// Middleware to get dataloaders
app.use(async (ctx, next) => {
  ctx.dataloaders = getDataloaders(loaders);
  await next();
});

app.use(
  koaI18next(i18next, {
    lookupCookie: 'lang', // detecting language in cookie
    order: ['cookie', 'header'],
    next: true,
  }),
);

app.use(i18nMiddleware);

// avoid requests from unknown clients
if (process.env.NODE_ENV !== 'development') {
  app.use(appPlatformMiddleware);
}

// Middleware to get result from authorization token
app.use(authMiddleware);

router.all(
  '/graphql',
  convert(
    graphqlHttp(
      async (request, ctx, koaContext): Promise<OptionsData> => {
        const { dataloaders, user } = koaContext;
        const { authorization, appversion, appbuild, appplatform, timezone = 'America/Sao_Paulo' } = request.header;

        if (process.env.NODE_ENV !== 'test') {
          console.info('Handling request', {
            appversion,
            appbuild,
            appplatform,
            timezone,
            unauthorized: !user,
            authorization,
            userId: idx(user, (_) => _._id),
          });
        }

        return {
          graphiql: process.env.NODE_ENV === 'development',
          schema,
          rootValue: { request: ctx.req },
          validationRules: process.env.NODE_ENV === 'production' ? [NoIntrospection] : [],
          context: {
            user,
            dataloaders,
            appplatform,
            koaContext,
            timezone,
            t,
          } as GraphQLContext,
          extensions: ({ document, variables, result }) => {
            if (process.env.NODE_ENV === 'development' && DEBUG_GRAPHQL) {
              if (document && !hasIntrospectionQuery(document)) {
                console.log(print(document));

                console.log(variables);

                console.log(JSON.stringify(result, null, 2));
              }
            }
            // the type of extensions does not accept null, but the code does
            return null as any;
          },
          formatError: (error: any) => {
            if (error.name && error.name === 'BadRequestError') {
              ctx.status = 400;
              ctx.body = 'Bad Request';
              return {
                message: 'Bad Request',
              };
            }

            if (error.path || error.name !== 'GraphQLError') {
              console.error(error);
            } else {
              console.log(`GraphQLWrongQuery: ${error.message}`);
            }

            console.error('GraphQL Error', { error });

            if (process.env.NODE_ENV !== 'production') {
              return {
                message: error.message,
                locations: error.locations,
                stack: error.stack,
              };
            } else {
              ctx.status = 400;
              ctx.body = 'Bad Request';
              return {
                message: 'Bad Request',
              };
            }
          },
        };
      },
    ),
  ),
);

app.use(router.routes()).use(router.allowedMethods());

export default app;
