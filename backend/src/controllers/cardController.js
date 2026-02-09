const { db } = require('../config/firebase');
const admin = require('firebase-admin');

// Tạo Card mới trong một Board
exports.createCard = async (req, res) => {
    try {
        const { boardId } = req.params; // Lấy từ URL: /boards/:boardId/cards
        console.log("Đang tạo card cho Board ID:", boardId); // Dòng này để debug

        const { title, description } = req.body;
        const creatorEmail = req.user.id;

        const cardRef = db.collection('cards').doc();
        const newCard = {
            id: cardRef.id,
            boardId: boardId, // Đảm bảo dùng đúng biến lấy từ params
            title: title,
            description: description || "",
            column: "To Do",
            list_member: [creatorEmail],
            tasks: [],
            createdAt: new Date().toISOString(),
            ownerId: creatorEmail
        };

        await cardRef.set(newCard);
        res.status(201).json(newCard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Đảm bảo có hàm này trong cardController.js
exports.getCardsByBoard = async (req, res) => {
    try {
        const { boardId } = req.params;
        const snapshot = await db.collection('cards')
                                 .where('boardId', '==', boardId)
                                 .get();

        const cards = [];
        snapshot.forEach(doc => cards.push({ id: doc.id, ...doc.data() }));
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        // Lấy đúng 2 ID cần thiết từ URL
        const { cardId, taskId } = req.params; 
        const { completed } = req.body;

        const cardRef = db.collection('cards').doc(cardId);
        const doc = await cardRef.get();
        
        if (!doc.exists) return res.status(404).json({ error: "Không tìm thấy Card" });

        let tasks = doc.data().tasks || [];
        
        // Tìm và cập nhật trạng thái task trong mảng
        tasks = tasks.map(t => (t.id === taskId ? { ...t, completed } : t));

        await cardRef.update({ tasks });
        res.json({ message: "Cập nhật thành công!", tasks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const { cardId } = req.params;
        await db.collection('cards').doc(cardId).delete();
        res.json({ message: "Đã xóa thẻ bài thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addTaskToCard = async (req, res) => {
    try {
        const { cardId } = req.params; // Lấy ID của Card từ URL
        const { taskTitle } = req.body; // Nội dung của task nhỏ

        if (!taskTitle) return res.status(400).json({ error: "Tiêu đề task không được để trống" });

        const newTask = {
            id: Date.now().toString(), // Tạo ID duy nhất cho task con
            title: taskTitle,
            completed: false, // Mặc định là chưa làm
            createdAt: new Date().toISOString()
        };

        const cardRef = db.collection('cards').doc(cardId);
        
        // Sử dụng arrayUnion để thêm phần tử vào mảng mà không ghi đè dữ liệu cũ
        await cardRef.update({
            tasks: admin.firestore.FieldValue.arrayUnion(newTask)
        });

        res.json({ message: "Thêm task thành công!", newTask });
    } catch (error) {
        res.status(500).json({ error: "Lỗi thêm task: " + error.message });
    }
};

exports.getCardsByUser = async (req, res) => {
    try {
        const { boardId, user_id } = req.params;

        // Truy vấn các card thuộc board cụ thể VÀ user nằm trong list_member
        const cardsSnapshot = await db.collection('cards')
            .where('boardId', '==', boardId)
            .where('list_member', 'array-contains', user_id)
            .get();

        const cards = [];
        cardsSnapshot.forEach(doc => {
            const data = doc.data();
            cards.push({
                id: doc.id,
                name: data.name,
                description: data.description,
                tasks_count: data.tasks_count || "0", // Theo yêu cầu response của bạn
                list_member: data.list_member || [],
                createdAt: data.createdAt || ""
            });
        });

        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy card theo user: " + error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        // Phải khớp chính xác với :cardId và :taskId trong Route
        const { cardId, taskId } = req.params; 
        
        console.log("Đang xóa Task:", taskId, "trong Card:", cardId);

        const cardRef = db.collection('cards').doc(cardId);
        const cardDoc = await cardRef.get();

        if (!cardDoc.exists) return res.status(404).json({ error: "Card không tồn tại" });

        const tasks = cardDoc.data().tasks || [];
        const filteredTasks = tasks.filter(task => task.id !== taskId);

        await cardRef.update({
            tasks: filteredTasks,
            tasks_count: filteredTasks.length 
        });

        res.json({ success: true, message: "Đã xóa task thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTasksByCard = async (req, res) => {
    try {
        // Lấy cardId từ URL params (đảm bảo khớp với tên biến trong Routes)
        const { cardId } = req.params;

        // Truy vấn trực tiếp vào document của Card
        const cardRef = db.collection('cards').doc(cardId);
        const cardDoc = await cardRef.get();

        // Kiểm tra Card có tồn tại không
        if (!cardDoc.exists) {
            return res.status(404).json({ error: "Không tìm thấy Thẻ (Card) này." });
        }

        const cardData = cardDoc.data();
        
        // Lấy mảng tasks, nếu chưa có thì trả về mảng rỗng
        const tasks = cardData.tasks || [];

        res.status(200).json({
            success: true,
            card_title: cardData.title,
            total_tasks: tasks.length,
            tasks: tasks
        });

    } catch (error) {
        res.status(500).json({ 
            error: "Lỗi khi lấy danh sách Task: " + error.message 
        });
    }
};

exports.getCardsByBoard = async (req, res) => {
    try {
        const { boardId } = req.params;

        // Truy vấn tất cả các card có boardId tương ứng
        // Bạn có thể thêm .orderBy('createdAt', 'asc') nếu có trường thời gian
        const cardsSnapshot = await db.collection('cards')
            .where('boardId', '==', boardId)
            .get();

        if (cardsSnapshot.empty) {
            return res.status(200).json({
                success: true,
                message: "Bảng này hiện chưa có thẻ nào.",
                cards: []
            });
        }

        const cards = [];
        cardsSnapshot.forEach(doc => {
            cards.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json({
            success: true,
            total_cards: cards.length,
            cards: cards
        });

    } catch (error) {
        res.status(500).json({ 
            error: "Lỗi khi lấy danh sách Card của bảng: " + error.message 
        });
    }
};

exports.getCardDetails = async (req, res) => {
    try {
        const { cardId } = req.params;

        // Truy vấn trực tiếp vào Document ID của Card
        const cardRef = db.collection('cards').doc(cardId);
        const cardDoc = await cardRef.get();

        if (!cardDoc.exists) {
            return res.status(404).json({ error: "Thẻ (Card) không tồn tại" });
        }

        const cardData = cardDoc.data();

        res.status(200).json({
            success: true,
            card: {
                id: cardDoc.id,
                ...cardData
            }
        });
    } catch (error) {
        res.status(500).json({ 
            error: "Lỗi khi lấy chi tiết thẻ: " + error.message 
        });
    }
};

exports.updateCard = async (req, res) => {
    try {
        const { cardId } = req.params;
        const updateData = req.body;

        const cardRef = db.collection('cards').doc(cardId);
        const cardDoc = await cardRef.get();

        if (!cardDoc.exists) {
            return res.status(404).json({ error: "Thẻ không tồn tại" });
        }

        // Loại bỏ các trường không cho phép cập nhật thủ công nếu cần (như id)
        delete updateData.id;

        // Thêm timestamp cập nhật
        updateData.updatedAt = new Date().toISOString();

        await cardRef.update(updateData);

        res.status(200).json({
            success: true,
            message: "Cập nhật thẻ thành công!",
            data: updateData
        });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi cập nhật thẻ: " + error.message });
    }
};

exports.getTaskDetails = async (req, res) => {
    try {
        const { cardId, taskId } = req.params;

        const cardRef = db.collection('cards').doc(cardId);
        const cardDoc = await cardRef.get();

        if (!cardDoc.exists) {
            return res.status(404).json({ error: "Thẻ không tồn tại" });
        }

        const cardData = cardDoc.data();
        const tasks = cardData.tasks || [];

        // Tìm task trong mảng tasks dựa trên id (hoặc thuộc tính định danh bạn đặt)
        const task = tasks.find(t => t.id === taskId);

        if (!task) {
            return res.status(404).json({ error: "Không tìm thấy Task này trong thẻ" });
        }

        res.status(200).json({
            success: true,
            task: task
        });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy chi tiết task: " + error.message });
    }
};

exports.assignTaskMember = async (req, res) => {
    try {
        // Lấy tham số từ URL (id ở đây là cardId theo thiết kế của bạn)
        const { cardId, taskId } = req.params;
        const { memberId } = req.body;

        if (!memberId) {
            return res.status(400).json({ error: "memberId là bắt buộc" });
        }

        const cardRef = db.collection('cards').doc(cardId);
        const cardDoc = await cardRef.get();

        if (!cardDoc.exists) {
            return res.status(404).json({ error: "Thẻ không tồn tại" });
        }

        let tasks = cardDoc.data().tasks || [];
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
            return res.status(404).json({ error: "Không tìm thấy Task" });
        }

        // Cập nhật memberId vào task
        tasks[taskIndex].memberId = memberId;
        tasks[taskIndex].updatedAt = new Date().toISOString();

        await cardRef.update({ tasks });

        // Trả về đúng cấu trúc 201 Created như yêu cầu
        res.status(201).json({
            taskId: taskId,
            memberId: memberId
        });

    } catch (error) {
        res.status(500).json({ error: "Lỗi hệ thống: " + error.message });
    }
};

exports.getTaskAssignment = async (req, res) => {
    try {
        // Tên biến ở đây phải khớp với tên trong file Route
        // Ở đây là 'id' (đại diện cho cardId) và 'taskId'
        const { cardId, taskId } = req.params; 

        // Kiểm tra cardId thay vì id
        if (!cardId || cardId === 'undefined') {
            return res.status(400).json({ error: "Thiếu ID của thẻ (cardId)" });
        }

        const cardRef = db.collection('cards').doc(cardId);
        const cardDoc = await cardRef.get();

        if (!cardDoc.exists) {
            return res.status(404).json({ error: "Thẻ không tồn tại" });
        }

        const tasks = cardDoc.data().tasks || [];
        
        // Tìm task (ép kiểu về chuỗi để so sánh chính xác)
        const targetId = String(taskId).trim();
        const task = tasks.find(t => String(t.id) === targetId);

        if (!task) {
            return res.status(404).json({ 
                error: "Không tìm thấy Task trong thẻ này",
                searchingFor: targetId 
            });
        }

        res.status(200).json({
            taskId: task.id,
            memberId: task.memberId || null
        });

    } catch (error) {
        // Lỗi "documentPath" thường do biến 'id' bị truyền vào là undefined
        res.status(500).json({ error: "Lỗi hệ thống: " + error.message });
    }
};

exports.unassignTaskMember = async (req, res) => {
    try {
        const { cardId, taskId } = req.params;

        const cardRef = db.collection('cards').doc(cardId);
        const cardDoc = await cardRef.get();

        if (!cardDoc.exists) {
            return res.status(404).json({ error: "Thẻ không tồn tại" });
        }

        let tasks = cardDoc.data().tasks || [];
        const taskIndex = tasks.findIndex(t => String(t.id) === String(taskId).trim());

        if (taskIndex === -1) {
            return res.status(404).json({ error: "Không tìm thấy Task để gỡ bỏ thành viên" });
        }

        // Cách 1: Gán về null (Giữ lại key memberId nhưng giá trị rỗng)
        tasks[taskIndex].memberId = null;
        
        // Cách 2: Xóa hẳn key memberId nếu muốn
        // delete tasks[taskIndex].memberId;

        await cardRef.update({ tasks });

        res.status(200).json({
            success: true,
            message: "Đã gỡ bỏ thành viên khỏi task thành công",
            taskId: taskId
        });

    } catch (error) {
        res.status(500).json({ error: "Lỗi khi gỡ bỏ thành viên: " + error.message });
    }
};