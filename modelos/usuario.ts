import { Document, Schema, Model, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { IUsuario } from '../interfaces/usuario';

export interface IUsuarioModel extends IUsuario, Document {
    fullName: string;
}

const rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE', 'BO_ROLE', 'SLD_ROLE', 'MOVIL_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

export var usuarioSchema: Schema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    apellidoP: { type: String, required: [true, 'Los apellidos son necesarios'] },
    apellidoM: { type: String, required: [true, 'Los apellidos son necesarios'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    status: { type: String, required: true, default: 'INACTIVO' },
    lingreso: { type: String, required: false },
    creadoX: { type: Schema.Types.ObjectId, ref: 'Usuario'}
}, { collection: 'usuarios' });

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

export const Usuario: Model<IUsuarioModel> = model<IUsuarioModel>("Usuario", usuarioSchema);

