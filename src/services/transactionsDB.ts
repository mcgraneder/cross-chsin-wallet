import Postgres from "./Database";
import { SmartWallet, UserOp } from "../api";

interface TransactionDBResponse {
  result: any;
  error: string | null;
}

interface TransactionParams {
  id: string;
  address: string;
  wallet: string;
  userOps: UserOp[];
  chainID: number;
  signature: string;
  txHash: string;
}

export interface GetFilters {
  id?: string;
  address?: string;
  chainID?: number;
  signature?: string;
  txHash?: string;
}

export class TransactionDB {
  /**
   * Creates `smart_wallet_txns` table in postgres if it does not exist
   * @returns {TransactionDBResponse} contains a `result` and an `error` property
   */
  public static async setUp(): Promise<TransactionDBResponse> {
    try {
      const client = await Postgres.getInstance();
      const tableExists = await client.schema.hasTable("smart_wallet_txns");
      if (!tableExists) {
        await client.schema.createTable("smart_wallet_txns", (table) => {
          table.string("id").notNullable();
          table.string("address").notNullable();
          table.string("wallet").notNullable();
          table.string("userOps", 10000).notNullable();
          table.integer("chainID").notNullable();
          table.string("signature", 1000).notNullable();
          table.string("txHash").notNullable();
          table.primary(["txHash"]);
        });
      }
    } catch (error: any) {
      console.error(error);
      return { result: null, error: error.toString() };
    }
    return { result: null, error: null };
  }

  /**
   * inserts the transaction to postgresDB
   * @param {TransactionParams} params - Params to save in database
   * @returns {TransactionDBResponse} An object containing a `result` and an `error`
   */
  public static async insert(
    params: TransactionParams
  ): Promise<TransactionDBResponse> {
    try {
      console.log("TransactionsDB: Logging to postgres: ", params);
      const client = await Postgres.getInstance();
      const res = await client("smart_wallet_txns").insert(
        { ...params, userOps: JSON.stringify(params.userOps) },
        "txHash"
      );
      console.log("TransactionsDB: Logging to postgres: DONE", params.txHash);
      return { result: res[0], error: null };
    } catch (error: any) {
      console.error(error);
      return { result: null, error: error.toString() };
    }
  }

  /**
   * Gets a transaction from db which matches the filters
   * @param filters filters to apply while querying
   * @returns {TransactionDBResponse} containing result (data from db) and error properties
   */
  public static async get({
    filters = {},
  }: {
    filters: GetFilters;
  }): Promise<TransactionDBResponse> {
    try {
      console.log(
        "TransactionsDB: Getting data from psql with filters",
        filters
      );

      const client = await Postgres.getInstance();
      const res = await client("smart_wallet_txns").where(filters);

      for (const data of res) {
        if (data) {
          data["userOps"] = JSON.parse(data["userOps"]);
        }
      }

      return { result: res, error: null };
    } catch (error: any) {
      console.error(error);
      return { result: null, error: error.toString() };
    }
  }

  /**
   * Only checks if filters have right properties
   * @param filters Filters to check
   * @returns {TransactionDBResponse} TransactionDBResponse
   */

  public static validateFilters(filters: GetFilters): TransactionDBResponse {
    const keys = Object.keys(filters);
    const propertiesToBePresent = ["id", "address", "chainID"];
    for (const key of keys) {
      if (!propertiesToBePresent.includes(key)) {
        console.error("TransactionsDB: ", "Invalid filters");
        return { error: "Invalid filters", result: null };
      }
    }

    return { result: 1, error: null };
  }
}
