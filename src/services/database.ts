import knex, { Knex } from "knex";

export default class Postgres {
  private static client: Knex;

  private static async connect(): Promise<Knex> {
    const config: Knex.Config = {
      client: "postgresql",
      connection: {
        user: "wallet_db_user",
        host: "dpg-cd5mmm82i3mphk00j720-a.singapore-postgres.render.com",
        database: "wallet_db",
        password: "jZuCydwn6n1DqbJk9RYDw8gh8TBGUZSp",
        port: 5432,
        ssl: true,
        keepAlive: true,
      },
      acquireConnectionTimeout: 5000,
      pool: {
        min: 0,
        max: 10,
        createTimeoutMillis: 8000,
        acquireTimeoutMillis: 8000,
        idleTimeoutMillis: 8000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
      },
    };
    Postgres.client = knex(config);
    return Postgres.client;
  }

  public static async getInstance(): Promise<Knex> {
    if (!Postgres.client) {
      Postgres.client = await this.connect();
    }

    return Postgres.client;
  }
}
