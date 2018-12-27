import { Router, Request, Response } from 'express';
import Server from '../clases/server';
import { usuariosConectados } from '../sockets/sockets';

const router = Router();

router.get('/mensajes', (req: Request, res: Response) => {
    res.json({
        ok: true,
        mensaje: 'Todo esta bien'
    });
});

router.post('/mensajes/:id', (req: Request, res: Response) => {

    const cuerpo = req.body.cuerpo;
    const de = req.body.de;
    const id = req.params.id;

    const payload = {
        de,
        cuerpo
    }
    const server = Server.instance;

    server.io.in(id).emit('mensaje-privado', payload);

    res.json({
        ok: true,
        de,
        cuerpo,
        id
    });
});

router.post('/mensajes', (req: Request, res: Response) => {
    const cuerpo = req.body.cuerpo;
    const de = req.body.de;
    const id = req.params.id;

    const payload = {
        de,
        cuerpo
    }
    const server = Server.instance;

    server.io.emit('mensaje-nuevo', payload);

    res.json({
        ok: true,
        de,
        cuerpo,
        id
    });
});

router.get('/usuarios', (req: Request, res: Response) => {
    const server = Server.instance;

    server.io.clients( ( err: any, clientes: any) => {
        if ( err ) {
            res.json()
        }
    });
});

router.get('/usuarios/detalle', (req: Request, res: Response) => {
    usuariosConectados

    res.json({
        ok: true,
        clientes: usuariosConectados.getLista()
    });
});


router.get('/prueba', (req: Request, res: Response) => {
    const headers = req.headers.authorization;

    res.json({
        headers: headers
    });
});

export default router;