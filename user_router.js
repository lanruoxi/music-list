`use strict`;
const express = require('express');
const userController = require('./controllers/userController');

//配置路由规则开始
let router = express.Router();
router.get('/login', userController.showLogin)//登录页
.get('/register', userController.showRegister)//注册页
//配置路由规则结束

//向外暴露
module.exports = router;