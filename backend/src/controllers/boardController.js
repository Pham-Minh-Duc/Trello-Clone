const { db } = require('../config/firebase');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin')

// Tận dụng transporter bạn đã cấu hình cho OTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // pmducnasani@gmail.com
    pass: process.env.EMAIL_PASS  // App Password của bạn
  }
});

exports.createBoard = async (req, res) => {
    try {
        const { title } = req.body;
        // Lấy ID từ token - đây là giá trị quan trọng nhất để truy vấn
        const userId = req.user.id; 

        const newBoard = {
            title: title,
            owner: req.user.email,
            ownerId: req.user.id,
            createdAt: new Date().toISOString(),
            columns: ['To Do', 'In Progress', 'Done'],
            members: []
        };

        const docRef = await db.collection('boards').add(newBoard);
        res.status(201).json({ id: docRef.id, ...newBoard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBoards = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const boardsRef = db.collection('boards');
        const cardsRef = db.collection('cards');

        // Bước 1: Lấy Board IDs từ collection Cards 
        // (Thỏa điều kiện: user là ownerId HOẶC nằm trong list_member)
        const [ownerCardsSnap, memberCardsSnap] = await Promise.all([
            cardsRef.where('ownerId', '==', userEmail).get(),
            cardsRef.where('list_member', 'array-contains', userEmail).get()
        ]);

        const boardIds = new Set();

        // Gom tất cả boardId từ Cards tìm được
        ownerCardsSnap.forEach(doc => boardIds.add(doc.data().boardId));
        memberCardsSnap.forEach(doc => boardIds.add(doc.data().boardId));

        // Bước 2: Lấy các Board mà user là chủ sở hữu trực tiếp (owner của Board)
        const ownerBoardsSnap = await boardsRef.where('owner', '==', userEmail).get();
        ownerBoardsSnap.forEach(doc => boardIds.add(doc.id));

        // Loại bỏ các giá trị null/undefined nếu có
        const finalBoardIds = Array.from(boardIds).filter(id => id);

        if (finalBoardIds.length === 0) {
            return res.json([]);
        }

        // Bước 3: Lấy thông tin chi tiết của tất cả Board IDs đã tìm thấy
        // Vì Firestore không hỗ trợ query 'in' quá 30 items, dùng Promise.all cho an toàn
        const boardDetailsPromises = finalBoardIds.map(id => boardsRef.doc(id).get());
        const boardSnapshots = await Promise.all(boardDetailsPromises);

        const result = boardSnapshots
            .filter(snap => snap.exists)
            .map(snap => ({
                id: snap.id,
                ...snap.data()
            }));

        console.log(`Tìm thấy ${result.length} bảng cho: ${userEmail}`);
        res.json(result);

    } catch (error) {
        console.error("Lỗi getBoards:", error.message);
        res.status(500).json({ error: "Lỗi khi lấy danh sách bảng công việc" });
    }
};

exports.deleteBoard = async (req, res) => {
    try {
        const { boardId } = req.params;
        const batch = db.batch();

        // 1. Tìm tất cả các Card thuộc về Board này
        const cardsSnapshot = await db.collection('cards')
            .where('boardId', '==', boardId)
            .get();

        // 2. Thêm lệnh xóa từng Card vào Batch
        cardsSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // 3. Thêm lệnh xóa chính cái Board đó vào Batch
        const boardRef = db.collection('boards').doc(boardId);
        batch.delete(boardRef);

        // 4. Thực thi tất cả các lệnh xóa cùng một lúc
        await batch.commit();

        res.json({ message: "Đã xóa Board và tất cả Card liên quan thành công!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi xóa Board: " + error.message });
    }
};

exports.inviteMember = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { board_owner_id, member_id, email_member, status } = req.body;

    // 1. Truy vấn tên bảng
    const boardDoc = await db.collection('boards').doc(boardId).get();
    const boardName = boardDoc.exists ? (boardDoc.data().title || "Dự án Trello") : "Dự án";

    // 2. Tạo bản ghi Invitation trong Firestore
    const inviteRef = db.collection('invitations').doc();
    const invitation = {
      id: inviteRef.id,
      boardId: boardId,
      boardName: boardName,
      cardId: req.body.card_id,
      createdAt: new Date().toISOString(),
      receiverEmail: email_member,
      receiverId: member_id,
      senderEmail: board_owner_id,
      senderId: board_owner_id,
      status: status || "pending"
    };

    await inviteRef.set(invitation);

    // 3. Cấu hình nội dung Email
    // Link này sẽ dẫn người dùng về trang xử lý trên React của bạn
    const actionLink = `http://localhost:5173/invitation/${inviteRef.id}?boardId=${boardId}&cardId=${req.body.card_id}&email=${email_member}`;

    const mailOptions = {
      from: `"Trello App" <${process.env.EMAIL_USER}>`,
      to: email_member,
      subject: `[Lời mời] Tham gia bảng công việc "${boardName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #0052cc; color: white; padding: 20px; text-align: center;">
            <h1>Lời mời tham gia bảng</h1>
          </div>
          <div style="padding: 30px; line-height: 1.6; color: #333;">
            <p>Chào bạn,</p>
            <p><strong>${board_owner_id}</strong> đã mời bạn cộng tác trong bảng công việc <strong>${boardName}</strong> trên Trello App mini.</p>
            <p>Vui lòng nhấn vào nút bên dưới để xem chi tiết và xác nhận lời mời:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionLink}" style="background-color: #0052cc; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Xem lời mời & Chấp nhận</a>
            </div>
            <p style="font-size: 12px; color: #777;">Nếu bạn không biết về dự án này, bạn có thể an tâm bỏ qua email này.</p>
          </div>
        </div>
      `
    };

    // 4. Gửi mail đồng thời trả về kết quả cho FE
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: "Lời mời đã được lưu và gửi email thành công!" 
    });

  } catch (error) {
    console.error("Lỗi gửi mail hoặc lưu DB:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.acceptInvitation = async (req, res) => {
    try {
        const { invite_id } = req.body;
        // Kiểm tra xem tên biến trong route của bạn là :id hay :cardId
        // Nếu trong route viết là /cards/:id thì ở đây dùng { id }
        const { boardId, cardId } = req.params; 

        console.log("Debug Params:", { boardId, cardId }); // Xem nó có ra đúng ID card không

        if (!cardId || cardId === 'undefined') {
            return res.status(400).json({ error: "Thiếu ID của Card trên URL" });
        }

        const inviteRef = db.collection('invitations').doc(invite_id);
        const inviteDoc = await inviteRef.get();
        if (!inviteDoc.exists) return res.status(404).json({ error: "Lời mời không tồn tại" });

        const inviteData = inviteDoc.data();
        const admin = require('firebase-admin');

        // Thực hiện cập nhật
        await inviteRef.update({ status: "accepted" });

        // Cập nhật vào Card
        await db.collection('cards').doc(cardId).update({
            list_member: admin.firestore.FieldValue.arrayUnion(inviteData.receiverId)
        });

        res.json({ success: true, message: "Đã thêm thành viên vào Card!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi chấp nhận lời mời: " + error.message });
    }
};

exports.getBoardDetails = async (req, res) => {
    try {
        const { boardId } = req.params; // Lấy boardboardId từ URL

        // 1. Lấy thông tin chi tiết của Board
        const boardRef = db.collection('boards').doc(boardId);
        const boardDoc = await boardRef.get();

        if (!boardDoc.exists) {
            return res.status(404).json({ error: "Bảng không tồn tại" });
        }

        const boardData = boardDoc.data();

        // 2. Lấy danh sách các Card thuộc về Board này
        // Giả sử mỗi Card của bạn có trường boardId để định danh
        const cardsSnapshot = await db.collection('cards')
            .where('boardId', '==', boardId)
            .get();

        const cards = [];
        cardsSnapshot.forEach(doc => {
            cards.push({ boardId: doc.data().boardId, ...doc.data() });
        });

        // 3. Trả về kết quả tổng hợp
        res.status(200).json({
            success: true,
            board: {
                id: boardDoc.id,
                ...boardData,
                cards: cards // Gắn danh sách card vào thông tin bảng
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy chi tiết bảng: " + error.message });
    }
};

exports.updateBoard = async (req, res) => {
    try {
        const { boardId } = req.params;
        const { title, description } = req.body;

        const boardRef = db.collection('boards').doc(boardId);
        const boardDoc = await boardRef.get();

        if (!boardDoc.exists) {
            return res.status(404).json({ error: "Bảng không tồn tại" });
        }

        // Tạo object chứa các dữ liệu muốn thay đổi
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        // Nếu không gửi gì lên thì báo lỗi
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "Vui lòng cung cấp Title hoặc Description để cập nhật" });
        }

        await boardRef.update(updateData);

        res.status(200).json({
            success: true,
            message: "Cập nhật bảng thành công!",
            updatedFields: updateData
        });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi cập nhật bảng: " + error.message });
    }
};