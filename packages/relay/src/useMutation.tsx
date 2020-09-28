import React from 'react';
import { useRelayEnvironment } from 'react-relay/hooks';
import { commitMutation, GraphQLTaggedNode, MutationConfig, MutationParameters } from 'relay-runtime';

const { useState, useRef, useCallback, useEffect } = React;

type isPending = boolean;
type ExecuteFn<TMutationParameters extends MutationParameters> = (
  config: Omit<MutationConfig<TMutationParameters>, 'mutation'>,
) => void;

export default function useMutation<TParameters extends MutationParameters>(
  mutation: GraphQLTaggedNode,
): [isPending, ExecuteFn<TParameters>] {
  const environment = useRelayEnvironment();
  const [isPending, setPending] = useState(false);
  const requestRef = useRef(null);
  const mountedRef = useRef(false);
  const execute = useCallback(
    (config = { variables: {} }) => {
      if (requestRef.current != null) {
        return;
      }
      const request = commitMutation(environment, {
        ...config,
        // @TODO - add notification here
        onCompleted: (response) => {
          if (!mountedRef.current) {
            return;
          }
          requestRef.current = null;
          setPending(false);
          config.onCompleted && config.onCompleted(response);
        },
        // @TODO - add notification here
        onError: (error) => {
          // eslint-disable-next-line no-console
          console.log(error);
          if (!mountedRef.current) {
            return;
          }
          requestRef.current = null;
          setPending(false);
          config.onError && config.onError(error);
        },
        mutation,
        updater: (store) => {
          if (typeof config.updater === 'function') {
            config.updater(store);
          }
        },
      });
      requestRef.current = request;
      setPending(true);
    },
    [mutation, environment],
  );
  useEffect(() => {
    mountedRef.current = true;
    return () => (mountedRef.current = false);
  }, []);
  return [isPending, execute];
}
