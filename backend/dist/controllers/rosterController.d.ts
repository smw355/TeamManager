import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const getPlayers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createPlayer: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updatePlayer: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePlayer: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=rosterController.d.ts.map