import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Server from '../clases/server';
import { Usuario } from '../modelos/usuario';
import path from 'path';
import verificaToken from '../middlewares/autenticacion';
const usuarioRoutes = Router();

//================================================
// Obtener todos los usuarios activos
//================================================
usuarioRoutes.get('/:status/:desde?/:limit?', verificaToken, (req: Request, res: Response) => {
    const admin = req.body.usuario;

    if ( admin.role !== 'ADMIN_ROLE' ) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Se requieren permisos de administrador'
        });
    }

    var desde = req.params.desde || 0;
    desde = Number(desde);

    var limit = req.params.limit || 5;
    limit = Number(limit);

    var status = req.params.status.toUpperCase();

    Usuario.find({ status: status }, 'nombre apellidoP apellidoM email img role')
            .skip(desde)
            .limit(limit)
            .exec( (err, usuarios) => {

                if ( err ){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error al recuperar usuarios',
                        err: err
                    });
                }

                Usuario.countDocuments({ status: status }, (err, conteo) => {
                    if ( err ) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error en el conteo de usuarios',
                            err: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });
            });
});

//================================================
// Crear usuario
//================================================
usuarioRoutes.post('/', verificaToken, (req: Request, res: Response) => {
    const body = req.body;

    const imgPath = path.resolve(__dirname, `../assets/no-img.jpg`);

    const admin = req.body.usuario;

    if ( admin.role !== 'ADMIN_ROLE' ) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Se requieren permisos de administrador'
        });
    }

    const usuario = new Usuario({
        nombre: body.nombre.toUpperCase(),
        apellidoP: body.apellidoP.toUpperCase(),
        apellidoM: body.apellidoM.toUpperCase(),
        email: body.email.toLowerCase(),
        password: bcrypt.hashSync(body.password, 10),
        img: imgPath,
        role: body.role,
        creadoX: admin._id
    });

    usuario.save(( err, usuarioGuardado ) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                err: err
            });
        }

        usuarioGuardado.password = 'XD';

        res.status(200).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });
    
});

//================================================
// Modificar usuario
//================================================
usuarioRoutes.put('/:id', verificaToken, (req: Request, res: Response) => {
    const id = req.params.id;
    const body = req.body;
    const admin = req.body.usuario;

    if ( admin._id !== id ) {
        if ( admin.role !== 'ADMIN_ROLE' ) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Necesitas permisos de administrador para modificar datos que no son tuyos'
            });
        }
    }

    Usuario.findById(id, ( err: any, usuario ) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                err: err
            });
        }

        if ( !usuario ) {
            return res.status(200).json({
                ok: false,
                mensaje: 'No existe un usuario con el ID ' + id,
            });
        }

        console.log(usuario);

        usuario.nombre = body.nombre.toUpperCase();
        usuario.apellidoP = body.apellidoP.toUpperCase();
        usuario.apellidoM = body.apellidoM.toUpperCase();

        usuario.save((err, usuarioGuardado) => {
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    err: err
                });
            }

            usuarioGuardado.password = 'XD';

            res.status(200).json({
                ok: true,
                mensaje: 'Usuario actualizado exitosamente',
                usuario: usuarioGuardado
            });
        });
        
    });
});

//================================================
// Buscar usuario
//================================================

//================================================
// Eliminar usuario
//================================================
usuarioRoutes.delete('/:id', verificaToken, (req: Request, res: Response) => {
    const admin = req.body.usuario;
    const id = req.params.id;

    if ( admin.role !== 'ADMIN_ROLE' ) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Necesitas permiso de administrador para borrar usuarios'
        });
    }

    if ( admin._id === id ) {
        return res.status(200).json({
            ok: false,
            mensaje: 'No puedes borrarte a ti mismo'
        });
    }

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                err: err
            });
        }

        if ( !usuarioBorrado ) {
            return res.status(200).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Usuario borrado exitosamente',
            usuario: usuarioBorrado
        });
    });
});

export default usuarioRoutes;