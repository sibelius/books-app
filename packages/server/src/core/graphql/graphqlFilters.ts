// inspired by: https://github.com/entria/graphql-mongo-helpers

import { ConnectionArguments } from 'graphql-relay';
import idx from 'idx';

import { JSObject } from '@booksapp/types';

import { GraphQLContext } from '../../types';
import { getObjectId } from '../../common/utils';

import { DIRECTION } from './enum/DirectionEnumType';

export const FILTER_CONDITION_TYPE = {
  MATCH_1_TO_1: 'MATCH_1_TO_1', // something that could be used on find() or $match
  CUSTOM_CONDITION: 'CUSTOM_CONDITION', // create a custom condition based on value
  AGGREGATE_PIPELINE: 'AGGREGATE_PIPELINE', // just an aggregate
};

export type BuiltConditionSet = {
  conditions: JSObject;
  pipeline: JSObject[];
};

type FilterFieldMappingMatch<ValueT> = {
  type: typeof FILTER_CONDITION_TYPE.MATCH_1_TO_1;
  key: string;
  format?: (value: ValueT, filter: JSObject, context: GraphQLContext, options?: JSObject<any>) => any;
};

type FilterFieldMappingPipeline<ValueT> = {
  type: typeof FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE;
  pipeline: JSObject[] | ((value: ValueT) => Array<{}>);
};

type FilterFieldMappingCustomCondition<ValueT> = {
  type: typeof FILTER_CONDITION_TYPE.CUSTOM_CONDITION;
  format: (value: ValueT, filter: JSObject, context: GraphQLContext, options?: JSObject<any>) => any;
};

type FilterFieldMapping<ValueT> =
  | FilterFieldMappingMatch<ValueT>
  | FilterFieldMappingPipeline<ValueT>
  | FilterFieldMappingCustomCondition<ValueT>
  | boolean;

export type FilterMapping = { [key: string]: FilterFieldMapping<any> };

const validOperators = ['gt', 'gte', 'lt', 'lte', 'in', 'nin', 'ne', 'all'];

const arrayOperators = ['in', 'nin', 'all'];

const getFilterName = (filterName: string) => filterName.split('_')[0];

type Operators = 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'ne' | 'all' | '$and' | '$or';

const handleAndOr = (operator: Operators) => (
  context: GraphQLContext,
  condition: Array<{}>,
  mapping: { [key: string]: FilterFieldMapping<{}> },
) => {
  if (!Array.isArray(condition)) {
    throw new Error(`Invalid filter supplied to ${operator}.`);
  }

  return {
    condition: condition.map((andCondition) => buildConditionsObject(context, andCondition, mapping)),
    conditionName: operator,
  };
};

const handleAnd = handleAndOr('$and');
const handleOr = handleAndOr('$or');

const handleFieldOperator = (
  context: GraphQLContext,
  condition: JSObject,
  conditionName: string,
  fieldMapping: FilterFieldMapping<JSObject>,
  prev: JSObject,
  filters: JSObject,
  options = {},
) => {
  // { "myField_operator": "something" } becomes { "myField": { $operator: "something" } }
  // { "myField": "something" } remains the same
  const conditionNamePieces = conditionName.split('_');
  const operator = conditionNamePieces.length > 1 ? conditionNamePieces.pop() : '';
  // I don't think we support snake case for field names, should this be here?
  conditionName = conditionNamePieces.join('_');

  if (fieldMapping && fieldMapping.format && typeof fieldMapping.format === 'function') {
    condition = fieldMapping.format(condition, filters, context, options);
  }

  if (operator) {
    if (validOperators.indexOf(operator) === -1) {
      throw new Error(`"${operator}" is not a valid operator on field "${conditionName}".`);
    }

    if (arrayOperators.indexOf(operator) >= 0 && !Array.isArray(condition)) {
      throw new Error(`Field "${conditionName}" must have an array value.`);
    }

    condition = {
      [`$${operator}`]: condition,
    };
  }

  // handle $gte and $let fields merge
  if (conditionName in prev) {
    condition = {
      ...condition,
      ...prev[conditionName],
    };
  }

  return {
    condition,
    conditionName,
  };
};

function buildConditionsObject<ValueT>(
  context: GraphQLContext,
  conditions: JSObject,
  mapping: { [key: string]: FilterFieldMapping<ValueT> },
  filters?: JSObject,
  options = {},
) {
  return Object.keys(conditions).reduce((prev, currentKey) => {
    let condition = conditions[currentKey];
    let conditionName = currentKey;

    const fieldMapping = mapping[getFilterName(currentKey)];

    if (fieldMapping === false) {
      return prev;
    }

    if (
      fieldMapping &&
      fieldMapping.type !== FILTER_CONDITION_TYPE.MATCH_1_TO_1 &&
      fieldMapping.type !== FILTER_CONDITION_TYPE.CUSTOM_CONDITION
    ) {
      return prev;
    }

    if (conditionName === 'AND') {
      ({ condition, conditionName } = handleAnd(context, condition, mapping));
    } else if (conditionName === 'OR') {
      ({ condition, conditionName } = handleOr(context, condition, mapping));
    } else {
      if (fieldMapping && fieldMapping.type === FILTER_CONDITION_TYPE.CUSTOM_CONDITION) {
        if (fieldMapping.format && typeof fieldMapping.format === 'function') {
          const customCondition = fieldMapping.format(condition, filters, context, options);

          return {
            ...prev,
            ...customCondition,
          };
        }
      }
      ({ condition, conditionName } = handleFieldOperator(
        context,
        condition,
        conditionName,
        fieldMapping,
        prev,
        filters,
        options,
      ));
    }

    conditionName = fieldMapping && fieldMapping.key ? fieldMapping.key : conditionName;

    if (condition === undefined) {
      return prev;
    }

    return {
      ...prev,
      [conditionName]: condition,
    };
  }, {});
}

export function buildMongoConditionsFromFilters<ValueT>(
  context: GraphQLContext,
  filters: JSObject,
  mapping: { [key: string]: FilterFieldMapping<ValueT> } = {},
  options = {},
): BuiltConditionSet {
  if (!filters) {
    return { conditions: {}, pipeline: [] };
  }

  const keys = Object.keys(filters);

  // first check if there are any pipeline mapped fields
  // and if AND or OR are also passed, if that is the case, we must throw an error
  // because we cannot use OR/AND while also using pipeline.
  const hasPipelineFilter = keys.find(
    (item) => idx(mapping[item], (_) => _.type) === FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE,
  );
  if (hasPipelineFilter && (filters.AND || filters.OR)) {
    throw new Error(
      `Wrong filter usage, because filter "${hasPipelineFilter}" is a pipeline filter, which should disable AND and OR`,
    );
  }

  // separate filters by type
  const filtersKeysGrouped = Object.keys(filters).reduce(
    (prev, key) => {
      const filterName = getFilterName(key);

      const type = (mapping && idx(mapping[filterName], (_) => _.type)) || FILTER_CONDITION_TYPE.MATCH_1_TO_1;

      return {
        ...prev,
        [type]: {
          ...prev[type],
          [key]: filters[key],
        },
      };
    },
    {
      // start with sane defaults
      [FILTER_CONDITION_TYPE.MATCH_1_TO_1]: {},
      [FILTER_CONDITION_TYPE.CUSTOM_CONDITION]: {},
      [FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE]: {},
    },
  );

  // first build our conditions JSObject.
  const conditions = buildConditionsObject(
    context,
    { ...filtersKeysGrouped.MATCH_1_TO_1, ...filtersKeysGrouped.CUSTOM_CONDITION },
    mapping,
    filters,
    options,
  );

  // now build the pipeline, which is more straightforward
  const pipeline = Object.keys(filtersKeysGrouped.AGGREGATE_PIPELINE).reduce((prev, key) => {
    const mappedFilter = mapping[key];
    // should not really happen!
    if (!mappedFilter || mappedFilter.type !== FILTER_CONDITION_TYPE.AGGREGATE_PIPELINE) {
      return prev;
    }

    const fieldPipeline = Array.isArray(mappedFilter.pipeline)
      ? mappedFilter.pipeline
      : mappedFilter.pipeline(filters[key], filters, context, options);

    return [...prev, ...(Array.isArray(fieldPipeline) ? fieldPipeline : [])];
  }, []);

  return {
    conditions,
    pipeline,
  };
}

type OrderByArg<SortT> = {
  sort: SortT;
  direction: typeof DIRECTION;
};

export function buildSortFromOrderByArg<Sort>(orderByArg: Array<OrderByArg<string>>): { [key: string]: 1 | -1 } {
  return orderByArg.reduce(
    (acc, item) => ({
      ...acc,
      [item.sort]: item.direction,
    }),
    {},
  );
}

// @TODO - treat when there's more than one $match
export function orderAggregatePipeline(pipeline: JSObject[]): JSObject[] {
  if (!pipeline.length) {
    return [];
  }

  // @TODO - support $geoWithin as well
  const geoNearStage = pipeline.find((stage) => !!stage.$geoNear);

  let orderedPipeline: JSObject[] = [];
  let conditions = {};
  for (const stage of pipeline) {
    // IMPORTANT: if the stage is geoNear put it as first of the pipeline
    if (!!stage.$geoNear) {
      orderedPipeline = [stage, ...orderedPipeline];
      continue;
    }

    // store the first appearing $match on conditions
    // discard it from the ordered pipeline
    if (!!stage.$match) {
      if (geoNearStage && Object.keys(conditions).length === 0) {
        conditions = { ...conditions, ...stage.$match };
        continue;
      }
    }

    orderedPipeline = [...orderedPipeline, stage];
  }

  // add conditions on query of $geoNear
  if (geoNearStage) {
    geoNearStage.$geoNear.query = { ...(geoNearStage.$geoNear.query || {}), ...conditions };
  }

  return orderedPipeline;
}

type ArgsWithFilter = {
  filters: { [key: string]: string };
} & { [key: string]: string } & ConnectionArguments;
export const withFilter = (args: ArgsWithFilter, filters: JSObject) => {
  return {
    ...args,
    filters: {
      ...(args.filters || {}),
      ...filters,
    },
  };
};

export const getFieldsOneToOne = (fields: string[], JSObjectId = false) => {
  const formatParam = JSObjectId ? { format: (value?: string) => value && getObjectId(value) } : {};

  return fields.reduce(
    (acc, field) => ({
      ...acc,
      [field]: {
        type: FILTER_CONDITION_TYPE.MATCH_1_TO_1,
        key: field,
        ...formatParam,
      },
    }),
    {},
  );
};
