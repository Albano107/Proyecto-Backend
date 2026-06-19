import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 1343,
    options: {
        trustServerCertificate: true,
        encrypt: false
    }
};

export const connectDB = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            await sql.connect(config);
            console.log('Conectado a SQL Server');
            return;
        } catch (error) {
            console.error(`Intento ${i + 1}/${retries} fallido:`, error.message);
            if (i < retries - 1) {
                console.log('Reintentando en 5 segundos...');
                await new Promise(res => setTimeout(res, 5000));
            }
        }
    }
    console.error('No se pudo conectar a SQL Server');
    process.exit(1);
};

export default sql;