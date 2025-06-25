import { Pool, PoolClient } from 'pg';
declare const pool: Pool;
export declare const validateConnection: () => Promise<boolean>;
export declare const query: (text: string, params?: any[]) => Promise<import("pg").QueryResult<any>>;
export declare const getClient: () => Promise<PoolClient>;
export declare const closePool: () => Promise<void>;
export default pool;
//# sourceMappingURL=connection.d.ts.map