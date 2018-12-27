import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { SEED } from '../global/enviroment';

function verificaToken(req: Request, res: Response, next: any) {
    const token: any = req.headers.authorization;

    jwt.verify(token, SEED, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'token incorrecto'
            });
        }

        req.body.usuario = decoded.usuario;

        next();
    });
}

export default verificaToken;