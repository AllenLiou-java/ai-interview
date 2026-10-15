import "server-only";
import dns from "node:dns";
import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

// 開發模式熱更新會重新執行模組，把連線快取在 global 上避免重複建立連線
const globalForMongoose = globalThis as unknown as { mongooseCache?: Cache };
const cache: Cache = (globalForMongoose.mongooseCache ??= { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("伺服器未設定 MONGODB_URI");

  cache.promise ??= connectWithSrvFallback(uri);
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}

// 部分 Windows 環境下 Node 的 DNS 設定（例如 127.0.0.1）無法查詢 mongodb+srv 需要的 SRV 紀錄，
// 此時改用公用 DNS 再試一次。可用 MONGODB_DNS_FALLBACK 指定（逗號分隔）。
async function connectWithSrvFallback(uri: string) {
  try {
    return await mongoose.connect(uri, { bufferCommands: false });
  } catch (err) {
    if ((err as { syscall?: string }).syscall !== "querySrv") throw err;
    const servers = (process.env.MONGODB_DNS_FALLBACK ?? "8.8.8.8,1.1.1.1")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    console.warn(`MongoDB SRV 查詢失敗，改用 DNS ${servers.join(", ")} 重試`);
    dns.setServers(servers);
    return mongoose.connect(uri, { bufferCommands: false });
  }
}
