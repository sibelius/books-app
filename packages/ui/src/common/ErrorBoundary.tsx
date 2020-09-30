import React from 'react';
import styled from 'styled-components/native';

const Container = styled.SafeAreaView`
  background: #fff;
  padding: 20px;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  color: #333;
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const Error = styled.Text`
  color: #999;
  font-size: 14px;
`;

interface Error {
  name: string;
  message: string;
  stack?: string;
}

interface State {
  error: Error | null;
}

interface IErrorBoundary {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<IErrorBoundary> {
  state: State = { error: null };

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    const { children } = this.props;
    const { error } = this.state;

    if (error) {
      return (
        <Container>
          <Title>Oops, an error occurred. Try again later</Title>
          <Error>Error: {error.message}</Error>
        </Container>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
