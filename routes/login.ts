import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Usuario } from '../modelos/usuario';
import jwt from 'jsonwebtoken';
import { SEED } from '../global/enviroment';

const loginRoutes = Router();


//================================================
// Login
//================================================
loginRoutes.post('/', (req: Request, res: Response ) => {
    const body = req.body;

    Usuario.findOne({ email: body.email}, (err, usuarioDB) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al tratar de ingresar',
                err: err
            });
        }

        if ( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas - email',
                err: err
            });
        }

        if ( usuarioDB.status === 'INACTIVO' ) {
            return res.status(200).json({
                ok: false,
                mensaje: 'El usuario esta inactivo, contacte a un administrador'
            });
        }

        if ( !bcrypt.compareSync( body.password, usuarioDB.password ) ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas - password',
                err: err
            });
        }

        usuarioDB.lingreso = new Date().toLocaleString();

        usuarioDB.save((err, usuarioDBA) => {
            if ( err ) {
                console.log('error en la actualizacion de ultima conexion');
            }

            const token = jwt.sign({ usuario: usuarioDBA }, SEED, { expiresIn: 14440} );

            usuarioDBA.password = 'XD';

            res.status(200).json({
                ok: true,
                usuario: usuarioDB,
                token: token,
                id: usuarioDB._id
            });
        });

    });
});

export default loginRoutes;