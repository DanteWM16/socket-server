// Imports
import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs'
import fileUpload from 'express-fileupload';

// Modelos
import { Usuario } from '../modelos/usuario';


const uploadRoutes = Router();

uploadRoutes.use(fileUpload());

uploadRoutes.post('/:tipo/:id', (req: Request, res: Response, next: NextFunction ) => {
    const tipo = req.params.tipo;
    const id = req.params.id;

    if ( !req.files ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            err: { messages: 'Debe seleccionar un archivo'}
        });
    }
    // Obtener nombre del archivo
    const archivo: any = req.files.imagen;
    const nombreCortado: string = archivo.name.split('.');
    const extensionArchivo = nombreCortado[nombreCortado.length -1 ];

    // Tipos validos
    const tiposValidos = ['usuarios'];

    if ( tiposValidos.indexOf(tipo) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El tipo no es valido',
            err: { message: 'Los tipos validos son ' + tiposValidos.join(', ')}
        });
    }

    // Extensiones validas
    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg' ];

    if ( extensionesValidas.indexOf(extensionArchivo) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida',
            err: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Generar nombre de archivo
    const nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover archivo al path predeterminado
    const path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, (err: any) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                err: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
        
    });
});

function subirPorTipo(tipo: string, id: string, nombreArchivo: string, res: any) {
    // Actualizar base de datos con imagen de usuario
    if ( tipo === 'usuarios') {
        Usuario.findById(id, (err: any, usuario) => {
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en base de datos al tratar de actualizar imagen de usuario',
                    err: err
                });
            }

            if ( !usuario ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el id ' + id + ' no existe',
                    err: err
                });
            }
            
            // Si existe una imagen de usuario, la reemplaza
            const pathViejo = './uploads/usuarios/' + usuario.img;

            if ( fs.existsSync(pathViejo) ) {
                fs.unlink(pathViejo, (err) => {
                    if ( err ) {
                        console.log(err);
                    }

                    console.log('archivo eliminado');
                });
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen',
                        err: err
                    });
                }

                usuarioActualizado.password = 'XD';

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
}

export default uploadRoutes;
