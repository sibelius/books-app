import React from 'react';
import { css } from 'styled-components/native';

import { Button, Column, Space } from '@booksapp/ui';

import useRouterAuth from '../../router/useRouterAuth';

const containerCss = css`
  padding: 0 24px;
`;

const Profile = () => {
  const { signOut } = useRouterAuth();

  return (
    <Column align="center" justify="center" flex={1} css={containerCss}>
      <Space height={20} />
      <Button onPress={signOut}>Sign out</Button>
    </Column>
  );
};

export default Profile;
