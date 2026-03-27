"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function main() {
    const connStr = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connStr)
        throw new Error('DATABASE_URL or DIRECT_URL is not set');
    const client = new pg_1.Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    await client.query('DELETE FROM "Task"');
    await client.query('DELETE FROM "User"');
    const passwordHash = await bcrypt_1.default.hash('password123', 10);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const adminRes = await client.query(`INSERT INTO "User" (email, password, name, role, "createdAt") VALUES ($1,$2,$3,'ADMIN',NOW()) RETURNING id`, ['admin@todo.com', passwordHash, 'Администратор']);
    const ivanRes = await client.query(`INSERT INTO "User" (email, password, name, role, "createdAt") VALUES ($1,$2,$3,'USER',NOW()) RETURNING id`, ['ivan@todo.com', passwordHash, 'Иван Иванов']);
    const anastasiaRes = await client.query(`INSERT INTO "User" (email, password, name, role, "createdAt") VALUES ($1,$2,$3,'USER',NOW()) RETURNING id`, ['anastasia@todo.com', passwordHash, 'Анастасия Смирнова']);
    const konstantinRes = await client.query(`INSERT INTO "User" (email, password, name, role, "createdAt") VALUES ($1,$2,$3,'USER',NOW()) RETURNING id`, ['konstantin@todo.com', passwordHash, 'Константин Петров']);
    const adminId = adminRes.rows[0].id;
    const ivanId = ivanRes.rows[0].id;
    const anastasiaId = anastasiaRes.rows[0].id;
    const konstantinId = konstantinRes.rows[0].id;
    const tasks = [
        ['Купить продукты', 'Молоко, хлеб, яйца, фрукты', today, false, 'NORMAL', ivanId],
        ['Сделать отчет', 'Подготовить отчет для руководства о результатах за прошедший квартал. Собрать все необходимые данные и проанализировать отчеты всех отделов.', today, true, 'IMPORTANT', anastasiaId],
        ['Позвонить клиенту', 'Обсудить условия нового договора с клиентом', tomorrow, false, 'NORMAL', konstantinId],
        ['Запланировать встречу', 'Организовать встречу команды для обсуждения квартального плана', nextWeek, false, 'NORMAL', ivanId],
        ['Прочитать книгу', 'Clean Code — Robert C. Martin', nextWeek, false, 'NORMAL', ivanId],
        ['Обновить документацию', 'Актуализировать техническую документацию по API', tomorrow, false, 'IMPORTANT', adminId],
        ['Проверить сервер', 'Проверить логи и состояние продакшн сервера', yesterday, true, 'IMPORTANT', adminId],
    ];
    for (const [title, description, dueDate, isCompleted, priority, userId] of tasks) {
        await client.query(`INSERT INTO "Task" (title, description, "dueDate", "isCompleted", priority, "createdAt", "updatedAt", "userId")
       VALUES ($1, $2, $3, $4, $5::\"Priority\", NOW(), NOW(), $6)`, [title, description, dueDate, isCompleted, priority, userId]);
    }
    await client.end();
    console.log('Seed completed:');
    console.log('  Users: admin@todo.com, ivan@todo.com, anastasia@todo.com, konstantin@todo.com');
    console.log('  Password for all: password123');
    console.log('  Tasks: 7 tasks created');
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
