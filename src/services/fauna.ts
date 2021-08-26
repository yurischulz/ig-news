import { Client } from "faunadb";

export const FaunaDB = new Client({
  secret: process.env.FAUNADB_SECRET_KEY,
});
