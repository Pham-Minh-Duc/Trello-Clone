require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { Server } = require('socket.io');
const boardRoutes = require('./src/routes/board');
const cardRoutes = require('./src/routes/card');
const PORT = process.env.PORT;
// Tạo Server HTTP từ app Express
const server = http.createServer(app);
// Khởi tạo Socket.io trên Server này
const io = new Server(server, {
    cors: { origin: "*" } 
});
const cors = require('cors');

app.use(cors()); // Cho phép tất cả các nguồn truy cập

app.use('/boards', boardRoutes);
app.use('/boards', cardRoutes);

io.on('connection', (socket) => {
    console.log('Một người dùng đã kết nối: ', socket.id);
});

server.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});