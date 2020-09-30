import React from 'react';
import { TextInputProps as ReactTextInputProps } from 'react-native';
import styled, { css } from 'styled-components/native';

import Row from './Row';
import Column from './Column';
import Space from './Space';
import Text from './Text';

const containerCss = css`
  width: 100%;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
`;

const Input = styled.TextInput<TextInputProps>`
  flex: 1;
  height: 40px;
  padding: 4px 16px;
  border: none;
  color: ${(p) => p.theme.colors.black};
  font-size: 16px;
  background: none;
  ${(p) => p.css}
`;

const Label = styled(Text)`
  color: ${(p) => p.theme.colors.black};
  font-size: ${(p) => p.theme.fontSizes.label};
  font-weight: ${(p) => p.theme.fontWeights.semiBold};
`;

const Error = styled(Text)`
  color: #ef3d52;
  font-size: 13px;
`;

export interface TextInputProps extends ReactTextInputProps {
  css?: any;
  icon?: React.ReactNode;
  label?: string;
  error?: string;
}

const TextInput = ({ label, icon, error, ...props }: TextInputProps) => {
  return (
    <Column style={{ width: '100%' }}>
      {label && (
        <>
          <Label>{label}</Label>
          <Space height={14} />
        </>
      )}
      <Row align="center" css={containerCss}>
        {icon && (
          <>
            {icon}
            <Space width={8} />
          </>
        )}
        <Input {...props} />
      </Row>
      <Space height={4} />
      <Error>{error}</Error>
    </Column>
  );
};

export default TextInput;
