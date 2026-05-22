const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const codePool = new Map();
const EXPIRE_TIME = 5 * 60 * 1000;

app.post('/sendCode', (req, res) => {
    const { target, type } = req.body;

    if (type === 'phone' && !/^1[3-9]\d{9}$/.test(target)) {
        return res.json({ success: false, msg: '手机号格式不正确' });
    }
    if (type === 'email' && !/^\w+([.-]\w+)*@\w+([.-]\w+)*\.\w{2,3}$/.test(target)) {
        return res.json({ success: false, msg: '邮箱格式不正确' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const createTime = Date.now();
    codePool.set(target, { code, createTime });
    console.log(`账号${target}，生成验证码：${code}`);
    res.json({ success: true, msg: '验证码已生成', code: code });
});

app.post('/checkCode', (req, res) => {
    const { target, code } = req.body;
    if (!codePool.has(target)) {
        return res.json({ success: false, msg: '请先获取验证码' });
    }
    const { code: realCode, createTime } = codePool.get(target);
    if (Date.now() - createTime > EXPIRE_TIME) {
        codePool.delete(target);
        return res.json({ success: false, msg: '验证码已过期，请重新获取' });
    }
    if (code !== realCode) {
        return res.json({ success: false, msg: '验证码错误' });
    }
    codePool.delete(target);
    res.json({ success: true, msg: '验证通过' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务运行正常，监听端口：${PORT}`);
});
