import Server from './clases/server';
import { SERVER_PORT } from './global/enviroment';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

// Importar rutas
import router from './routes/router';
import usuarioRoutes from './routes/usuario';
import loginRoutes from './routes/login';
import uploadRoutes from './routes/upload';


const server = Server.instance;

// BodyParser
server.app.use( bodyParser.urlencoded({extended:true}) );
server.app.use( bodyParser.json());

// CORS
server.app.use( cors({ origin: true, credentials: true }) );

// Rutas de servicios
server.app.use('/upload', uploadRoutes);
server.app.use('/login', loginRoutes);
server.app.use('/usuario', usuarioRoutes);
server.app.use('/', router);

// Conexión a base de datos mongoDB
mongoose.connect('mongodb://localhost/astrum', { useCreateIndex: true, useNewUrlParser: true}, ( err ) => {

    if ( err ) throw err;

    console.log('Conectado a la base de datos');
});


server.start(() => {
    console.log(`Servidor corriendo en puerto ${ SERVER_PORT }`);
});
