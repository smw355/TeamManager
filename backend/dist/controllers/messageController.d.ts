import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const getMessages: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createMessage: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=messageController.d.ts.map