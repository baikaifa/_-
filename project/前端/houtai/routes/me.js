var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const common = require('../md5加密/common');
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'xinyue'
});
//产生随机数
function suijishu() {
  var random_range = 9999;

  function make_number(random_range) {
    random_number = parseInt(random_range * Math.random());
    return random_number;
  }
  random_number = make_number(random_range);
  return random_number = random_number.toString();
  //返回字符串random_number
}
//产生随机数结束

router.post('/sendCode', function (req, res) {
  console.log('sendCode');
  var success = true;
  code = suijishu(); //不使用var就可以声明为全局变量
  var message = "短信已发送到您的手机请注意查收"
  var str = '';
  req.on('data', function (data) {
    str += data;
  });
  req.on('end', function () {
    var tel = JSON.parse(str).tel;
    //判断有没有这个用户
    db.query("select * from user_table where tel =" + tel + "", (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send('database error').end();
      } else {
        console.log(data == '');
        if (data == '') { //没有注册过
          var ret = {
            'success': success,
            'code': code,
            'message': message
          };
          res.send(ret);
        } else {
          var ret = {
            state: '用户已注册'
          }
          res.send(ret)
        }
      }
    })
  });
});
router.post('/validateCode', function (req, res) {
  console.log('ValidateCOde');
  var str = '';
  req.on('data', function (data) {
    str += data;
  });
  req.on('end', function () {
    str = JSON.parse(str).code; //获取前台发的验证码 string类型
    console.log(code); //后台产生的验证码
    if (str == code) {
      var ret = {
        'success': true,
        'message': "验证成功"
      };
      res.send(ret);
    } else {
      var ret = {
        'success': false,
        'message': '验证失败'
      };
      res.send(ret);
    }
  })

})


router.post('/register', function (req, res) {
  console.log('register');
  var str = '';
  req.on('data', function (data) {
    str += data;
  });
  req.on('end', function () {
    var tel = JSON.parse(str).tel;
    tel = parseInt(tel) //用户的电话号码
    var password = parseInt(JSON.parse(str).password); //用户的密码
    var password = common.md5(String(password) + common.MD5_SUFFIX); //md5加密后的密码
    // db.query("INSERT INTO user_table(tel,password) VALUES(15345664,'password')", (err, data) => {
    db.query("INSERT INTO user_table(tel,password) VALUES('" + tel + "','" + password + "')", (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send('database error').end();
      } else {

        db.query("SELECT * FROM user_table where tel = '" + tel + "'", (err, data) => {
          if (err) {
            console.log(err);
            res.status(500).send('database error').end();
          } else {
            id = JSON.parse(JSON.stringify(data))[0].ID; //保留id
            var ret = {
              'success': true,
              'message': "注册成功",
              userinfo: {
                'id': JSON.parse(JSON.stringify(data))[0].ID, //先转化为字符串，再转化为json对象,注意ID的大小写
                'tel': tel,
                'password': password
              }
            };
            console.log('插入成功');
            res.send(ret);
          }
        })

      }
    })
  })

})
router.post('/doLogin', function (req, res) {
  console.log('doLogin');
  var str = '';
  req.on('data', function (data) {
    str += data;
  });
  req.on('end', function () {
    str = JSON.parse(str); //转换为对象
    var tel = str.username;
    password = str.password;
    var password = common.md5(password + common.MD5_SUFFIX); //md5加密后的密码
    db.query("SELECT * FROM user_table where tel = '" + tel + "'", (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send('database error').end();
      } else {
        var id = JSON.parse(JSON.stringify(data))[0].ID; //保留id
        var md5_password = JSON.parse(JSON.stringify(data))[0].password; //数据库中的密码
        console.log(password);
        console.log(md5_password);
        if (password == md5_password) {
          var ret = {
            'success': true,
            'message': "登陆成功",
            userinfo: {
              'id': id,
              'username': str.username,
              'password': str.password
            }
          };
          res.send(ret);
        }else{
          var ret={
            'message':'密码错误'
          }
          res.send(ret);
        }
      }
    })
  })

})

module.exports = router;
