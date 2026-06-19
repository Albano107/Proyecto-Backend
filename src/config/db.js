import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    driver: process.env.DB_DRIVER,
    options: {
        trustedConnection: true
    }
};

export const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log('Conectado a SQL Server');
    } catch (error) {
        console.error('Error de conexión:', error);
    }
};

export default sql;