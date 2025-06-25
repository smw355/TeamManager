import { Request, Response, NextFunction } from 'express';
import { User } from '../types';
interface AuthRequest extends Request {
    user?: User;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requireRole: (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=auth.d.ts.map