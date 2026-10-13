"use client";

import { ApolloProvider as ApolloProviderBase } from "@apollo/client/react";
import { apolloClient } from "@/lib/apollo-client";

type ApolloProviderProps = {
  children: React.ReactNode;
};

export const ApolloProvider = ({
  children,
}: ApolloProviderProps) => {
  return (
    <ApolloProviderBase client={apolloClient}>
      {children}
    </ApolloProviderBase>
  );
};