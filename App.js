import React from 'react';
import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {createHttpLink} from 'apollo-link-http';
import {ApolloProvider} from '@apollo/react-hooks';
import Navigator from './src/Navigator';

const client = new ApolloClient({
  link: createHttpLink({uri: 'http://api.doeatrecord.com/graphql'}),
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Navigator/>
    </ApolloProvider>
  );
}
