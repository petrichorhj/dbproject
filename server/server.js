const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const app = express()

app.set('etag', 'weak')
app.use(cors())
app.use(express.json())

// ======================
// 🔌 数据库连接
// ======================
const pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'note_user',
    password: '123456',
    database: 'note_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

async function testDB() {
    try {
        const conn = await pool.getConnection();
        console.log("✅ 成功连接服务器 MySQL 数据库！")
        conn.release();
    } catch (err) {
        console.log("❌ 数据库连接失败：", err.message)
    }
}
testDB();

// ======================
// ✅ Token 验证中间件
// ======================
const auth = (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({ code: 401, msg: "请先登录" });
    }
    next();
};

// ======================
// 用户接口
// ======================
app.get('/api/user/list', auth, async(req, res) => {
    try {
        const { pageNum = 1, pageSize = 10, username, status } = req.query
        let sql = 'SELECT * FROM user WHERE 1=1'
        let params = []

        if (username) {
            sql += ' AND username LIKE ?'
            params.push(`%${username}%`)
        }
        if (status !== undefined) {
            sql += ' AND status = ?'
            params.push(status)
        }

        const [totalRows] = await pool.query(sql.replace('SELECT *', 'SELECT COUNT(*) as count'), params)
        const total = totalRows[0].count

        sql += ' ORDER BY id DESC LIMIT ?, ?'
        params.push((pageNum - 1) * pageSize, parseInt(pageSize))

        const [list] = await pool.query(sql, params)
        res.json({ code: 200, data: { list, total } })
    } catch (err) {
        res.json({ code: 500, msg: '获取失败', err: err.message })
    }
})

app.post('/api/user/add', auth, async(req, res) => {
    try {
        const { username, password, nickname } = req.body
        await pool.query(
            'INSERT INTO user (username, password, nickname) VALUES (?, ?, ?)', [username, password, nickname]
        )
        res.json({ code: 200, msg: '新增成功' })
    } catch (err) {
        res.json({ code: 500, msg: '新增失败', err: err.message })
    }
})

app.post('/api/user/update', auth, async(req, res) => {
    try {
        const { id, username, nickname, status } = req.body
        await pool.query(
            'UPDATE user SET username=?, nickname=?, status=? WHERE id=?', [username, nickname, status, id]
        )
        res.json({ code: 200, msg: '编辑成功' })
    } catch (err) {
        res.json({ code: 500, msg: '编辑失败' })
    }
})

app.post('/api/user/delete', auth, async(req, res) => {
    try {
        const { id } = req.body
        await pool.query('DELETE FROM user WHERE id=?', [id])
        res.json({ code: 200, msg: '删除成功' })
    } catch (err) {
        res.json({ code: 500, msg: '删除失败' })
    }
})

// ✅ 登录接口（兼容前端，返回 data.token）
app.post('/api/login', async(req, res) => {
    try {
        const { username, password } = req.body
        const [rows] = await pool.query(
            'SELECT * FROM user WHERE username=? AND password=?', [username, password]
        )
        if (rows.length > 0) {
            const token = 'token-' + Date.now()
            res.json({
                code: 200,
                data: { token }
            })
        } else {
            res.json({ code: 500, msg: '账号或密码错误' })
        }
    } catch (err) {
        res.json({ code: 500, msg: '登录失败', err: err.message })
    }
})

// ✅ 兼容浏览器 GET 访问测试
app.get('/api/login', (req, res) => {
    res.json({ code: 500, msg: '请使用 POST 方法登录' })
})

// ======================
// 笔记接口
// ======================
app.get('/api/note/list', auth, async(req, res) => {
    const [rows] = await pool.query(
        'SELECT * FROM notes WHERE is_deleted = 0 ORDER BY update_time DESC'
    )
    res.json({ code: 200, data: rows })
})

app.get('/api/note/detail', auth, async(req, res) => {
    const { id } = req.query
    const [rows] = await pool.query(
        'SELECT * FROM notes WHERE id = ?', [id]
    )
    res.json({ code: 200, data: rows[0] })
})

app.post('/api/note/save', auth, async(req, res) => {
    const { id, title, content, folder_id } = req.body
    if (id) {
        await pool.query(
            'UPDATE notes SET title = ?, content = ?, folder_id = ?, update_time = NOW() WHERE id = ?', [title, content, folder_id, id]
        )
    } else {
        await pool.query(
            'INSERT INTO notes (title, content, folder_id, create_time, update_time) VALUES (?, ?, ?, NOW(), NOW())', [title || '无标题', content || '', folder_id || null]
        )
    }
    res.json({ code: 200, msg: '保存成功' })
})

app.post('/api/note/delete', auth, async(req, res) => {
    const { id } = req.body
    await pool.query(
        'UPDATE notes SET is_deleted = 1, update_time = NOW() WHERE id = ?', [id]
    )
    res.json({ code: 200, msg: '已移入回收站' })
})

app.get('/api/note/trash', auth, async(req, res) => {
    const [rows] = await pool.query(
        'SELECT * FROM notes WHERE is_deleted = 1 ORDER BY update_time DESC'
    )
    res.json({ code: 200, data: rows })
})

app.post('/api/note/recover', auth, async(req, res) => {
    const { id } = req.body
    await pool.query(
        'UPDATE notes SET is_deleted = 0 WHERE id = ?', [id]
    )
    res.json({ code: 200, msg: '已恢复' })
})

app.post('/api/note/destroy', auth, async(req, res) => {
    const { id } = req.body
    await pool.query('DELETE FROM notes WHERE id = ?', [id])
    res.json({ code: 200, msg: '已永久删除' })
})

// ======================
// 笔记本接口
// ======================
app.get('/api/notebook/list', auth, async(req, res) => {
    const [rows] = await pool.query('SELECT * FROM notebooks ORDER BY id ASC')
    res.json({ code: 200, data: rows })
})

app.post('/api/notebook/add', auth, async(req, res) => {
    const { name } = req.body
    await pool.query('INSERT INTO notebooks (name) VALUES (?)', [name])
    res.json({ code: 200, msg: '创建成功' })
})

app.post('/api/notebook/del', auth, async(req, res) => {
    const { id } = req.body
    await pool.query('DELETE FROM notebooks WHERE id = ?', [id])
    res.json({ code: 200, msg: '删除成功' })
})

// ======================
// 启动服务
// ======================
const PORT = 3001
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 后端服务已启动：http://0.0.0.0:${PORT}`)
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        app.listen(3002, '0.0.0.0', () => {
            console.log(`✅ 端口被占用，已切换到：http://0.0.0.0:3002`)
        })
    }
})