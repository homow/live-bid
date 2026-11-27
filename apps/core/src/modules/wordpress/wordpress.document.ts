// GraphQL documents for WordPress. Operation names must match the
// operationName that WordpressService sends with each request.

const FEATURED_IMAGE = `
  featuredImage { node { sourceUrl altText mediaDetails { width height } } }
`;

const CATEGORIES = `categories { nodes { databaseId slug name } }`;

// Enough for cards and archives, no full body.
const POST_SUMMARY = `
  databaseId id slug date modified title excerpt commentCount
  ${FEATURED_IMAGE}
  ${CATEGORIES}
`;

// Never select the commenter's email here, this data goes to the public.
const COMMENT_FIELDS = `
  databaseId id date content parentDatabaseId
  author { node { name } }
`;

export const GET_POSTS = `
  query GetPosts($first: Int!, $after: String, $where: RootQueryToPostConnectionWhereArgs) {
    posts(first: $first, after: $after, where: $where) {
      pageInfo { hasNextPage endCursor }
      nodes { ${POST_SUMMARY} }
    }
  }
`;

export const GET_POST = `
  query GetPost($id: ID!, $idType: PostIdType!) {
    post(id: $id, idType: $idType) {
      ${POST_SUMMARY}
      content
      commentStatus
    }
  }
`;

export const GET_CATEGORIES = `
  query GetCategories {
    categories(first: 100, where: { orderby: NAME, order: ASC }) {
      nodes { databaseId slug name count }
    }
  }
`;

// Top-level comments, each with its direct replies (two levels).
// For deeper threads, nest another `replies { nodes { ... } }` inside.
export const GET_COMMENTS = `
  query GetComments($first: Int!, $after: String, $where: RootQueryToCommentConnectionWhereArgs) {
    comments(first: $first, after: $after, where: $where) {
      pageInfo { hasNextPage endCursor }
      nodes {
        ${COMMENT_FIELDS}
        replies(first: 50, where: { order: ASC, orderby: COMMENT_DATE }) {
          nodes { ${COMMENT_FIELDS} }
        }
      }
    }
  }
`;

export const CREATE_COMMENT = `
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      success
      comment { ${COMMENT_FIELDS} }
    }
  }
`;
