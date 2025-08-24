"use strict";
import { AppDataSource } from "../config/configDb.js";

export async function withTransaction(work) {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction(); // si necesitas aislamiento: startTransaction("SERIALIZABLE")

  try {
    const result = await work(queryRunner.manager); // <— manager transaccional
    await queryRunner.commitTransaction();
    return result;
  } catch (err) {
    try { await queryRunner.rollbackTransaction(); } catch {}
    throw err;
  } finally {
    await queryRunner.release();
  }
}
