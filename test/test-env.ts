// Same credentials as infra/docker-compose-db.yaml, but a separate database.
// The name has to end with _test, the helpers refuse to truncate anything else.
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://user:password@127.0.0.1:5432/live_bid_test";
