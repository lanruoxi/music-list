// module.exports 默认是一空对象，和exports 是相等的
'use strict';
// 引入数据库操作db对象
const db = require('../models/db');
//解析文件上传
const formidable = require('formidable');
//引入path核心对象
const path = require('path');
//引入配置对象
const config = require('../config');


/**
 * [添加音乐]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.addMusic = (req,res,next)=>{

    //判断是否存在session上的user
    if(!req.session.user){
        res.send(`
                 请去首页登录
                 <a href="/user/login">点击</a>
            `);
        return;
    }
    // console.log(req.session.user);
    
   

    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(config.rootPath,'public/files');
    form.parse(req, function(err, fields, files) {
        if(err) return next(err);
        // { title: '告白气球', singer: '周杰伦', time: '03:00' }
        // { file:{}
        // console.log(fields);
        // console.log(files);
        //获取6个字段中的3个
        let datas = [fields.title,fields.singer,fields.time];
        let sql = 'insert into musics (title,singer,time,';
        let params = '(?,?,?';
        //两个路径
        if(files.file){
            //获取文件名
            let filename = path.parse(files.file.path).base;
            //如果上传了文件
            datas.push(`/public/files/${filename}`);
            sql += 'file,';
            params += ',?';
        }
        if(files.filelrc){
            //获取文件名
            let lrcname = path.parse(files.filelrc.path).base;
            //如果上传了文件
            datas.push(`/public/files/${lrcname}`);
            sql += 'filelrc,';
            params += ',?';
        }
        params += ',?)';
        sql += 'uid) values ';
        //用户的id
        datas.push(req.session.user.id);
        // console.log(sql);
        // console.log(params);
        //插入音乐数据
        db.q(sql + params ,datas,(err,data)=>{
            res.json({
                code:'001',
                msg:'添加音乐成功'
            });
        });
    });};
/**
 * [更新音乐]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.updateMusic = (req,res,next)=>{
    //判断是否存在session上的user
    if(!req.session.user){
        res.send(`
                 请去首页登录
                 <a href="/user/login">点击</a>
            `);
        return;
    }
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(config.rootPath,'public/files');
    form.parse(req, function(err, fields, files) {
        if(err) return next(err);
        //获取6个字段中的3个
        let sql = 'update musics set title=?,singer=?,time=?,';
        let datas = [fields.title,fields.singer,fields.time]; 
        //两个路径
        if(files.file){
            //获取文件名
            let filename = path.parse(files.file.path).base;
            //如果上传了文件
            datas.push(`/public/files/${filename}`);
            sql += 'file=?,';
        }
        if(files.filelrc){
            //获取文件名
            let lrcname = path.parse(files.filelrc.path).base;
            //如果上传了文件
            datas.push(`/public/files/${lrcname}`);
            sql += 'filelrc=?,';
        }
        //去除一个逗号
        sql = sql.substr(0,sql.length -1);
        //加上条件
        sql += 'where id = ?';
        datas.push(fields.id);
        //更新音乐数据
        db.q(sql,datas,(err,data)=>{
            res.json({
                code:'001',
                msg:'更新音乐成功'
            });
        });
    });
};

//删除音乐
exports.delMusic = (req, res, next)=> {
    //获取用户参数
    let userid = req.session.user.id;

    //接受参数
    let musicId = req.query.id;
    //db删除数据
    db.q('delete from musics where id = ? and uid =?',[musicId,userid],(err, result)=>{
        if(err) return next(err);
        if(result.affectedRows == 0){
            return res.json({
                code: '002',
                msg: '歌曲不存在'
            });
        }
        //删除成功
        res.json({
            code: '001',
            msg: '删除成功'
        });
    });
}

//添加音乐
exports.showAddMusic = (req, res, next)=> {
    res.render('add.html');
}

//音乐列表
exports.showListMusic = (req, res, next)=> {
    let userId = req.session.user.id;
    db.q('select * from musics where uid = ?', [userId],(err,musics)=> {
        res.render('list.html', {
            musics,
        })
    })
}
