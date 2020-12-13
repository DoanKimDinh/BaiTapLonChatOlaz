const express = require("express")
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const { check, validationResult, query } = require("express-validator")
const AWS_CONFIG = require("./config/config")
const nodemailer = require('nodemailer')
const otpGenerator = require('otp-generator')
const BUCKET = 'olaz-user3'
const { v1: uuidv1 } = require('uuid')
const AWS = require('aws-sdk')
const jwt = require("jwt-then")
const Busboy = require('busboy');
const multer = require('multer');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static("build"));

const server = require('http').createServer(app);
const io = require('socket.io')(server,{
    cors: {
        origin: "http://localhost:3000",
        credentials: true
      }
});
// io.use(async (socket, next) => {
//     try {
//         const token = socket.handshake.query.token;
//         const payload = await jwt.verify(token, 'nguyendepzai');
//         socket.userId = payload.id
//         next()
//     } catch (err) { 
//         console.log(err);
//     }
// })
io.on("connection",(socket)=>{
    console.log("connection socket.io ",socket.id);
    socket.on("disconnect",()=>{
        console.log("ngat ket noi " + socket.id)
    });
    socket.on('add_change_dataFriend',(data_id)=>{
        socket.broadcast.emit('get_dataFriendRequest');
    });
    socket.on('change_friend_request',(id) =>{    
        socket.broadcast.emit('change_dataFriend');
    });
    socket.on('send_message',(newMessage)=>{
        socket.broadcast.emit('change_message_user',(newMessage));
    })
    socket.on('send_message_group',(newMessage)=>{
        socket.broadcast.emit('change_message_user_group',(newMessage));
    })
});
server.listen(3001,()=>{
    console.log("Server running " +3001);
});

const docClient = new AWS.DynamoDB.DocumentClient({
    region: AWS_CONFIG.REGION,
    accessKeyId: AWS_CONFIG.ACCESSID,
    secretAccessKey: AWS_CONFIG.SECRETKEY
})
const s3Client = new AWS.S3({
    accessKeyId: AWS_CONFIG.ACCESSID,
    secretAccessKey: AWS_CONFIG.SECRETKEY,
    region: AWS_CONFIG.region
});
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });
doUpload = (req, res) => {
    params = {
        Bucket: BUCKET,
        Key: req.file.originalname,
        Body: req.file.buffer
    }
    s3Client.upload(params, (err, data) => {
        if (err) {
            return res.json({success: false, err})
        }
        return res.json({ success: true, url : res.req.file.path, fileName : res.req.file.originalname });
    });
}
doDownload = (req, res) => {
    params = {
        Bucket: BUCKET,
        Key: req.params.filename
    }
    s3Client.getObject(params)
        .createReadStream()
        .on('error', function (err) {
            res.status(500).json({ error: "Error -> " + err });
        }).pipe(res);
}
doDelete = (req, res) => {
    params = {
        Bucket: BUCKET,
        Key: req.params.filename
    }
    s3Client.deleteObject(params, (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error -> " + err });
            return;
        }
        console.log('Successfully deleted file.');
        res.send(JSON.stringify({ status: 200, error: null, response: data }));
        return;
    });
}
app.get('/api/files/:filename', doDownload);
app.post('/api/files/upload', upload.single("avatar"), doUpload);
app.get('/api/deletefile/:filename', doDelete);
app.get('/api/get', (req, res) => {
    const params_scan = {
        TableName: "UserOlaz",
    };
    docClient.scan(params_scan, (err, data) => {
        if (err) {
            console.log("Loi khi scan", JSON.stringify(err, null, 2))
            res.send(err)
        }
        else {
            res.send(JSON.stringify({ status: 200, error: null, response: data.Items }))
        }
    })
});
app.get('/api/getUser', (req, res) => {
    const id = req.body.id;
    const params = {
        TableName: "UserOlaz",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        },
    };
    docClient.scan(params, (error, data) => {
        if (error)
            res.send(error);
        if ([...data.Items].length <= 0) {
            // return res.json({ msg: data.Items });
            res.send(JSON.stringify({ response: data }))
        }
    });
});
app.post('/api/friends', (req, res) => {
    const id = req.body.id;
    console.log("id da nhan duoc " +id);
    const params_scan = {
        TableName: "UserOlaz",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        },
    };
    docClient.scan(params_scan, (err, data) => {
        if (err) {
            console.log("Loi khi scan", JSON.stringify(err, null, 2))
            res.send(err)
        }
        else {
            let users = data.Items;
            let friendTam = [];
            let ketQua = [];
            users.forEach((item) => {
                //  friendTam= item.friends;
                if (item.friends != "") {//neu co danh sach ban be
                    let friendBan = [];
                    let frie = item.friends;

                    frie.forEach((element) => {
                        if (element.trangThaiFriend == true) { //neu trang thai la dang ket ban
                            friendBan.push(element)        //them vao trong list friend ban be
                        }
                    })
                    item.friends = friendBan;
                    ketQua.push(item);
                }
            })
            res.send(JSON.stringify({ response: ketQua }))
        }
    })
});
app.post('/api/friendsforupdategroup', async (req, res) => {
    const id = req.body.id;
    const idGroup = req.body.idGroup
    const params_scan_Friends = {
        TableName: "UserOlaz",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        },
    };
    const params_scan_FriendsInGroup = {
        TableName: "GroupOlaz",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": idGroup
        },
    };

    let allFriends = [];
    let friendsInGroup = [];
    let result = [];
    let temp = [];
    let idFriends = []

    docClient.scan(params_scan_Friends, (err, data_Friends) => {
        if (err) {
            console.log("Loi khi scan Friends", JSON.stringify(err, null, 2))
            res.send(err)
        }
        else {
            let users = data_Friends.Items;     // day la nguyen
            users.forEach((item) => {
                if (item.friends != "") {
                    let frie = item.friends;    // ban be cua nguyen
                    frie.forEach((element) => {
                        if (element.trangThaiFriend == true) {
                            idFriends.push(element.idFriend)    // id cua tat ca ban be cua nguyen
                            allFriends.push(element)     // tat ca ban be cua nguyen (1)
                        }
                    })
                }
            })
            // res.send(JSON.stringify({ response: allFriends }))
            docClient.scan(params_scan_FriendsInGroup, async (err, data_FriendsInGroup) => {
                if (err) {
                    console.log("Loi khi scan FriendsInGroup", JSON.stringify(err, null, 2))
                    res.send(err)
                }
                else {
                    let groups = data_FriendsInGroup.Items; // nhom cua nguyen
                    groups.forEach((item) => {
                        if (item.group_members != "") {
                            let members = item.group_members;   //ban be trong nhom cua nguyen
                            members.forEach((element) => {
                                if (element.idUser != id) {   // tru` nguyen ra
                                    friendsInGroup.push(element.idUser)    // ban be trong nhom cua nguyen (2)
                                }
                            })
                        }
                    })
                    temp = idFriends.filter(function (item) {
                        return !friendsInGroup.includes(item);
                    })
                    // res.send(JSON.stringify({ response: friendsInGroup }))
                    // for (var i = 0; i < allFriends.length; i++) {
                    //     for (var j = 0; j < friendsInGroup.length; j++) {
                    //         if (allFriends[i].idFriend == friendsInGroup[j].idUser) { // (1) - (2)
                    //             result.push(allFriends[i])
                    //         }
                    //     }
                    // }
                    for (var i = 0; i < allFriends.length; i++) {
                        for (var j = 0; j < temp.length; j++) {
                            if (allFriends[i].idFriend == temp[j]) {
                                result.push(allFriends[i])
                            }
                        }
                    }
                    res.send(JSON.stringify({ response: result }))
                }
            })
        }
    })
});
app.post('/api/friend_requests', (req, res) => {
    const id = req.body.id;

    const params_scan = {
        TableName: "UserOlaz",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        },
    };
    docClient.scan(params_scan, (err, data) => {
        if (err) {
            console.log("Loi khi scan", JSON.stringify(err, null, 2))
            res.send(err)
        }
        else {
            let users = data.Items;
            let friendTam = [];
            let ketQua = [];
            users.forEach((item) => {
                //  friendTam= item.friends;
                if (item.friends != "") {//neu co danh sach ban be
                    let friendBan = [];
                    let frie = item.friends;
                    frie.forEach((element) => {
                        if (element.trangThaiFriend == false) { //neu trang thai la dang ket ban
                            friendBan.push(element)        //them vao trong list friend ban be
                        }
                    })
                    item.friends = friendBan;
                    ketQua.push(item);
                }
            })
            res.send(JSON.stringify({ response: ketQua }))
        }
    })
});
app.post('/api/chapnhanketban', (req, res) => {
    const id = req.body.id;
    let params = {
        TableName: "UserOlaz",
        Key: {
            "id": id
        },
        UpdateExpression: "set friends = list_append( friends, :id )",
        ExpressionAttributeValues: {
            ":id": id,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(params, (err, data) => {
        if (err) {
            console.log("Loi khi update: ", JSON.stringify(err, null, 2))
            return res.json({ msg: "false" })
        }
        res.send(JSON.stringify({ status: 200, error: null, response: "Da set trang thai dang hoat dong" }));
    })
});
app.post('/api/dangNhapAdmin', (req, res) => {
    const sdt = req.body.sdt;
    const email = req.body.email;
    const pass = req.body.pass;

    let params = {};
    if (sdt == '') {
        params = {
            TableName: "UserOlaz",
            FilterExpression: "email = :email and pass = :pass and tinhtrang = :tinhtrang and admin = :admin",
            ExpressionAttributeValues: {
                ":email": email,
                ":pass": pass,
                ":tinhtrang": 1,
                ":admin": 1
            },
        };
    }
    else {
        params = {
            TableName: "UserOlaz",
            FilterExpression: "sdt = :sdt and pass = :pass and tinhtrang = :tinhtrang and admin = :admin",
            ExpressionAttributeValues: {
                ":sdt": sdt,
                ":pass": pass,
                ":tinhtrang": 1,
                ":admin": 1
            },
        };
    }
    docClient.scan(params, (error, data) => {
        if (error)
            return res.send(error);
        else if ([...data.Items].length <= 0) {
            return res.json({ msg: "admin-false" });
        }
        else if ([...data.Items].length > 0) {
            data.Items.map(async (user) => {
                const token = await jwt.sign({ id: user.id }, 'nguyendepzai');
                // console.log(user.id)
                // console.log(token)
                return res.json({ msg: "admin-true", token: token, id: user.id, ten: user.ten, avatar: user.avatar, email: user.email, sdt: user.sdt, pass: user.pass });
            })
        }
    });
});
app.post('/api/dangNhapUser', async (req, res) => {
    const sdt = req.body.sdt;
    const email = req.body.email;
    const pass = req.body.pass;

    let params = {};
    if (sdt == '') {
        params = {
            TableName: "UserOlaz",
            FilterExpression: "email = :email and pass = :pass and tinhtrang = :tinhtrang and admin = :admin",
            ExpressionAttributeValues: {
                ":email": email,
                ":pass": pass,
                ":tinhtrang": 1,
                ":admin": 0
            },
        };
    }
    else {
        params = {
            TableName: "UserOlaz",
            FilterExpression: "sdt = :sdt and pass = :pass and tinhtrang = :tinhtrang and admin = :admin",
            ExpressionAttributeValues: {
                ":sdt": sdt,
                ":pass": pass,
                ":tinhtrang": 1,
                ":admin": 0
            },
        };
    }
    docClient.scan(params, async (error, data) => {
        if (error)
            return res.send(error);
        else if ([...data.Items].length <= 0) {
            return res.json({ msg: "user-false" });
        }
        else if ([...data.Items].length > 0) {
            data.Items.map(async (user) => {
                const token = await jwt.sign({ id: user.id }, 'nguyendepzai');
                // console.log(user.id)
                // console.log(token)
                return res.json({ msg: "user-true", token: token, id: user.id, ten: user.ten, avatar: user.avatar, email: user.email, sdt: user.sdt, pass: user.pass });
            })
        }
    });
});
app.post('/api/kiemTraTrungEmail', (req, res) => {
    const email = req.body.email;
    const params = {
        TableName: "UserOlaz",
        FilterExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email
        },
    };
    docClient.scan(params, (error, data) => {
        if (error)
            res.send(error);
        else if ([...data.Items].length <= 0) {
            return res.json({ msg: "false" });
        }
        else if ([...data.Items].length > 0) {
            return res.json({ msg: "true" });
        }
    });
});
app.post('/api/getUserByEmailAndPass', (req, res) => {
    const email = req.body.email;
    const pass = req.body.pass;
    const params = {
        TableName: "UserOlaz",
        FilterExpression: "email = :email and pass = :pass and tinhtrang = :tinhtrang and admin = :admin",
        ExpressionAttributeValues: {
            ":email": email,
            ":pass": pass,
            ":tinhtrang": 1,
            ":admin": 1
        },
    };
    docClient.scan(params, (error, data) => {
        if (error)
            return res.send(error);
        else if ([...data.Items].length <= 0) {
            return res.json({ msg: "false" });
        }
        else if ([...data.Items].length > 0) {
            return res.json({ msg: "true" });
        }
    });
});
app.post('/api/updateTrangThaiUser', (req, res) => {
    const email = req.body.diaChiMail;
    const sdt = req.body.soDienThoai;
    const id = req.body.id;

    let paramsUpdate = {
        TableName: "UserOlaz",
        Key: {
            "id": id
        },
        UpdateExpression: "set tinhtrang= :tinhtrang",
        ExpressionAttributeValues: {
            ":tinhtrang": 1,
        },
        ReturnValues: "UPDATED_NEW"
    }

    docClient.update(paramsUpdate, (err, data) => {
        if (err) {
            console.log("Loi khi update: ", JSON.stringify(err, null, 2))
            return res.json({ msg: "false" })
        }
        res.send(JSON.stringify({ status: 200, error: null, response: "Da set trang thai dang hoat dong" }));
    })

});
app.post('/api/updateUser', (req, res) => {
    const email = req.body.email;
    const sdt = req.body.sdt;
    const id = req.body.id;
    const ten = req.body.ten;
    const avatar = req.body.avatar;
    const pass = req.body.pass;
    let paramsUpdate = {};
    if (avatar == "") {
        paramsUpdate = {
            TableName: "UserOlaz",
            Key: {
                "id": id
            },
            UpdateExpression: "set ten= :ten, sdt= :sdt, email= :email",
            ExpressionAttributeValues: {
                ":ten": ten,
                ":sdt": sdt,
                ":email": email,
            },
            ReturnValues: "UPDATED_NEW"
        }
    } else {
        paramsUpdate = {
            TableName: "UserOlaz",
            Key: {
                "id": id
            },
            UpdateExpression: "set ten= :ten, sdt= :sdt, email= :email, avatar= :avatar, pass= :pass",
            ExpressionAttributeValues: {
                ":ten": ten,
                ":sdt": sdt,
                ":email": email,
                ":avatar": avatar,
                ":pass": pass
            },
            ReturnValues: "UPDATED_NEW"
        }
    }
    docClient.update(paramsUpdate, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        return res.json({ msg: "true" });
    })
})
app.post('/api/updateMatKhau', (req, res) => {
    const id = req.body.id;
    const pass = req.body.pass;
    let paramsUpdate = {
        TableName: "UserOlaz",
        Key: {
            "id": id
        },
        UpdateExpression: "set pass= :pass",
        ExpressionAttributeValues: {
            ":pass": pass,
        },
        ReturnValues: "UPDATED_NEW"
    }

    docClient.update(paramsUpdate, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        return res.json({ msg: "true" });
    })
});
app.put('/api/disableUser', (req, res) => {
    const id = req.body.id;

    let paramsUpdate = {
        TableName: "UserOlaz",
        Key: {
            "id": id
        },
        UpdateExpression: "set tinhtrang= :tinhtrang",
        ExpressionAttributeValues: {
            ":tinhtrang": 0,
        },
        ReturnValues: "UPDATED_NEW"
    }

    docClient.update(paramsUpdate, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        res.send(JSON.stringify({ status: 200, error: null, response: "Khóa Người Dùng Thành Công" }));
    })
});
app.put('/api/enableUser', (req, res) => {
    const id = req.body.id;
    let paramsUpdate = {
        TableName: "UserOlaz",
        Key: {
            "id": id
        },
        UpdateExpression: "set tinhtrang= :tinhtrang",
        ExpressionAttributeValues: {
            ":tinhtrang": 1,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(paramsUpdate, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        res.send(JSON.stringify({ status: 200, error: null, response: "Mở Khóa Người Dùng Thành Công" }));
    })
});
app.post('/api/resetPassword', (req, res) => {
    const id = req.body.id;
    let paramsUpdate = {
        TableName: "UserOlaz",
        Key: {
            "id": id
        },
        UpdateExpression: "set pass= :pass",
        ExpressionAttributeValues: {
            ":pass": "12345678",
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(paramsUpdate, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        res.send(JSON.stringify({ status: 200, error: null, response: "Reset pass thanh cong" }));
    })
});
app.delete('/api/delete', (req, res) => {
    const id = req.body.id
    const params_delete = {
        TableName: "UserOlaz",
        Key: {
            "id": id
        }
    };
    docClient.delete(params_delete, (err, data) => {
        if (err) {
            return res.json({ msg: "Loi roi" })
        }
        else {
            res.send(JSON.stringify({ status: 200, error: null, response: "Xóa Thành Công" }));
        }
    })
});
app.post('/api/insert', [
    check("ten", "hoang").not().isEmpty(),
    check("sdt", "0898123564").isLength({ min: 10, max: 10 }),
], async (req, res) => {
    const ten = req.body.ten
    const sdt = req.body.sdt
    const email = req.body.email
    const pass = req.body.pass
    const avatar = 'no-image.jpg'
    if (ten == "") {
        return res.json({ msg: "Tên không được rỗng" });
    }
    else if (sdt == "") {
        return res.json({ msg: "Số điện thoại không được rỗng" });
    }
    else if (email == "") {
        return res.json({ msg: "Email không được rỗng" });
    }
    else if (pass == "") {
        return res.json({ msg: "Mật khẩu không được rỗng" });
    }
    const params_add = {
        TableName: "UserOlaz",
        Item: {
            "id": uuidv1(),
            "ten": ten,
            "sdt": sdt,
            "email": email,
            "pass": pass,
            "tinhtrang": 1,
            "admin": 0,
            "friends": [],
            "friend_requests": [],
            "messages": [],
            "avatar": avatar
        }
    }
    docClient.put(params_add, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        return res.json({ msg: "true" });
    })
});
app.post('/api/dangky',
    [
        check("ten", "hoang").not().isEmpty(),
        check("sdt", "0898123564").isLength({ min: 10, max: 10 }),
    ],
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }
        const ten = req.body.ten;
        const sdt = req.body.sdt;
        const email = req.body.email;
        const pass = req.body.pass;
        const pass_xacnhan = req.body.pass_xacnhan;
        const tinhtrang = 1;
        const admin = 0;
        if (ten == "") {
            return res.json({ msg: "Tên không được rỗng" });
        }
        else if (sdt == "") {
            return res.json({ msg: "Số điện thoại không được rỗng" });
        }
        else if (email == "") {
            return res.json({ msg: "Email không được rỗng" });
        }
        else if (pass == "") {
            return res.json({ msg: "Mật khẩu không được rỗng" });
        }
        else if (pass != pass_xacnhan) {
            return res.json({ msg: "Mật khẩu xác nhận không khớp" });
        }
        const avatar = 'no-image.jpg'

        const params_add = {
            TableName: "UserOlaz",
            Item: {
                "id": uuidv1(),
                "ten": ten,
                "sdt": sdt,
                "email": email,
                "pass": pass,
                "tinhtrang": tinhtrang,
                "admin": admin,
                "friends": [],
                "friend_requests": [],
                "avatar": avatar
            }
        }
        docClient.put(params_add, (err, data) => {
            if (err) {
                return res.json({ msg: "false" });
            }
            return res.json({ msg: "true" });
        })
    });
app.post('/api/send-email', (req, res) => {
    var otp = otpGenerator.generate(6, { upperCase: false, alphabets: false, specialChars: false });
    const maxacthuc = req.body.maxacthuc;
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'olaznhomver08@gmail.com',
            pass: "nhomver08"
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    var content = '';
    content += `test gmail`;
    var mainOptions = {
        from: 'olaznhomver08@gmail.com',
        to: req.body.email,//req.body.email
        subject: 'GMAIL XAC THUC TAI KHOAN',
        text: 'Mã xác thực tài khoản của bạn là: ' + otp,
    }
    transporter.sendMail(mainOptions, (err, info) => {
        if (err) {
            console.log(err);
            return res.json({ msg: "false" });
        }
        else {
            console.log('Message sent: ' + info.response);
            return res.json({ msg: otp });
        }
    });
});
app.post('/api/addFriendToUser', async (req, res) => {
    const id = req.body.id;
    //const email = req.body.email;
    const idfriend = req.body.idfriend;
    //const tenfriend = req.body.tenfriend;
    const trangthai = false;

    let friendChinh = await getByIdUser(id);
    let friendAdd = await getByIdUser(idfriend);

    //   return res.json({mes:friendAdd, mes2: friendChinh});

    //  user = friendChinh; //cha
    let friChinhItem;     //con
    friendChinh.forEach((item) => {
        friChinhItem = item;  //gan con
    })

    let friAdd;
    friendAdd.forEach((item) => {
        friAdd = item;  //gan con
    })

    let friend_req = [];
    if (friChinhItem.friend_requests !== []) {        //rong
        friend_req = friChinhItem.friend_requests;   //them vào trong friend_request của thằng gửi yêu cầu
    }
    friend_req.push({ idFriend: friAdd.id, tenFriend: friAdd.ten, trangThaiFriend: false, avatarFriend: friAdd.avatar, sdtFriend: friAdd.sdt, emailFriend: friAdd.email, tinhtrangFriend: friAdd.tinhtrang });

    let friend_res = [];
    if (friAdd.friends !== []) {        //rong
        friend_res = friAdd.friends;   //   thêm vào trong friends của thằng được gửi yêu cầu
    }
    friend_res.push({ idFriend: friChinhItem.id, tenFriend: friChinhItem.ten, trangThaiFriend: false, avatarFriend: friChinhItem.avatar, sdtFriend: friChinhItem.sdt, emailFriend: friChinhItem.email, tinhtrangFriend: friChinhItem.tinhtrang });

    let paramsUpdateReq = {
        TableName: "UserOlaz",
        Key: {
            "id": idfriend
        },
        UpdateExpression: "set friends= :friends",
        ExpressionAttributeValues: {
            ":friends": friend_res,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(paramsUpdateReq, (err, data) => {
        if (err) {
            console.log(err);
        }
    })

    let paramsUpdate = {     //thằng muốn gửi yêu cầu kết bạn
        TableName: "UserOlaz",
        Key: {
            "id": id        //id của thằng muốn thêm
        },
        UpdateExpression: "set friend_requests= :friend_requests",//thêm yêu cầu bạn bè
        ExpressionAttributeValues: {
            ":friend_requests": friend_req,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(paramsUpdate, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        return res.json({ msg: "true" });
    })

});
app.post('/api/updateTrangThaiFriend', async (req, res) => {
    const id = req.body.id;
    const idFriend = req.body.idfriend;
    const trangthai = true;


    const params = {
        TableName: "UserOlaz",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        },
    };
    var user;
    docClient.scan(params, async (error, data) => {
        if (error)
            console.log(error);
        else {
            user = await data.Items;
            let useritem;
            user.forEach((item) => {
                useritem = item;
            })
            let friends = [];
            if (useritem.friends === []) {
                return res.json({ msg: "chua co friend nao" });
            }

            friends = useritem.friends;
            friends.forEach((item) => {
                if (item.idFriend == idFriend) {
                    item.trangThaiFriend = true;
                }
            })
            let paramsUpdate = {
                TableName: "UserOlaz",
                Key: {
                    "id": id
                },
                UpdateExpression: "set friends= :friends",
                ExpressionAttributeValues: {
                    ":friends": friends,
                },
                ReturnValues: "UPDATED_NEW"
            }
            docClient.update(paramsUpdate, (err, data) => {
                if (err) {
                    //          return res.json({ msg: "false" });
                }
                //      return res.json({ msg: "true" });
            })

        }
    })

    var ten = await getByIdUser(req.body.idfriend);
    var userChinh = await getByIdUser(req.body.id);

    let userItem = [];
    ten.forEach((item) => {
        userItem = item;
    })


    let userChinhItem = [];
    userChinh.forEach((item) => {
        userChinhItem = item;
    })


    userItem.friend_requests.forEach((item, index, obj) => {
        if (item.idFriend == id) {
            obj.splice(index, 1);
        }
    })
    userItem.friends.push()

    let friend_res = [];
    if (userItem.friends !== []) {        //rong
        friend_res = userItem.friends;   //   thêm vào trong friends của thằng được gửi yêu cầu
    }
    friend_res.push({ idFriend: id, tenFriend: userChinhItem.ten, trangThaiFriend: true, sdtFriend: userChinhItem.sdt, emailFriend: userChinhItem.email, avatarFriend: userChinhItem.avatar });
    let paramsUpdate = {
        TableName: "UserOlaz",
        Key: {
            "id": idFriend
        },
        UpdateExpression: "set friend_requests= :friend_requests",
        ExpressionAttributeValues: {
            ":friend_requests": userItem.friend_requests,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(paramsUpdate, (err, data) => {
        if (err) {
            //        return res.json({ msg: "false" });
        }
        //   return res.json({ msg: "true" });
    })

    let paramsUpdateFriend = {
        TableName: "UserOlaz",
        Key: {
            "id": idFriend
        },
        UpdateExpression: "set friends= :friends",
        ExpressionAttributeValues: {
            ":friends": friend_res,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(paramsUpdateFriend, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        return res.json({ msg: "true" });
    })
});
app.post('/api/XoaYeuCauKetBan', async (req, res) => {
    const id = req.body.id;
    const idFriend = req.body.idfriend;
    const trangthai = true;

    const params = {
        TableName: "UserOlaz",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        },
    };
    var user;
    docClient.scan(params, async (error, data) => {
        if (error)
            console.log(error);
        else {
            user = await data.Items;
            let useritem;
            user.forEach((item) => {
                useritem = item;
            })
            let friends = [];
            if (useritem.friends === []) {
                return res.json({ msg: "chua co friend nao" });
            }

            friends = useritem.friends;
            friends.forEach((item, index, obj) => {
                if (item.idFriend == idFriend) {
                    obj.splice(index, 1);
                }
            })

            let paramsUpdate = {
                TableName: "UserOlaz",
                Key: {
                    "id": id
                },
                UpdateExpression: "set friends= :friends",
                ExpressionAttributeValues: {
                    ":friends": friends,
                },
                ReturnValues: "UPDATED_NEW"
            }
            docClient.update(paramsUpdate, (err, data) => {
                if (err) {
                    //      return res.json({ msg: "false" });
                }
                //  return res.json({ msg: "true" });
            })
        }
    })

    let userList = await getByIdUser(req.body.idfriend);

    let userItem;
    userList.forEach((item) => {
        userItem = item;
    })
    userItem.friend_requests.forEach((item, index, obj) => {
        //    console.log(item.idFriend+"====="+ id);
        if (item.idFriend == id) {
            obj.splice(index, 1);
        }
    })
    //   console.log(userItem.friend_requests);

    let paramsUpdateFriendRequest = {
        TableName: "UserOlaz",
        Key: {
            "id": idFriend
        },
        UpdateExpression: "set friend_requests= :friend_requests",
        ExpressionAttributeValues: {
            ":friend_requests": userItem.friend_requests,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(paramsUpdateFriendRequest, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        return res.json({ msg: "true" });
    })
});
app.post("/api/timKiemFriend", async (req, res) => {
    const timkiem = req.body.timkiem;
    const id = req.body.id;

    const params = {
        TableName: "UserOlaz",
        FilterExpression: "sdt = :sdt",
        ExpressionAttributeValues: {
            ":sdt": timkiem
        },
    };
    var ten = await getByIdUser(req.body.id);

    let giatri3 = await docClient.scan(params, (error, data) => {
        if (error)
            console.log(error);
        else {
            //  return res.json({response:data.Items})
        }
    }).promise();

    if (giatri3.Items == "") {
        paramsEmail = {
            TableName: "UserOlaz",
            FilterExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": timkiem
            },
        };
        giatri3 = await docClient.scan(paramsEmail, (error2, data2) => {
            if (error2)
                console.log(error2);
            else {
                //        return res.json({response:data2.Items});
            }
        }).promise();
    }

    console.log(giatri3.Items == "");
    if (giatri3.Items == "") {
        return res.json({ mess: "khongtimthay" });
    }

    let ma;
    giatri3.Items.forEach((item) => {
        ma = item.id;
    });
    let bientam = 0;

    ten.forEach((item) => {
        console.log("doan kim dinh" + item)
        item.friends.forEach((ele) => {
            //  console.log("doan kim dinh")
            //  console.log(ele.idFriend + ele.trangThaiFriend+ma)
            if (ele.idFriend == ma && ele.trangThaiFriend == true) {
                bientam = 1;
                return res.json({ mess: "ban be", user: giatri3.Items })
            } else if (ele.idFriend == ma && ele.trangThaiFriend == false) {
                bientam = 1;
                return res.json({ mess: "chua xac nhan", user: giatri3.Items });
            }
        })
        item.friend_requests.forEach((ele) => {
            if (ele.idFriend == ma) {
                bientam = 1;
                return res.json({ mess: "da gui yeu cau", user: giatri3.Items })
            }
        })
    });
    if (bientam == 0) {
        return res.json({ mess: "hay gui yeu cau", user: giatri3.Items })
    }
})
app.post("/api/checkSendRequestFriend", async (req, res) => {
    let id = req.body.id;
    let idfriend = req.body.idfriend;
    const params = {
        TableName: "UserOlaz",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        },
    };
    let giatri = await docClient.scan(params, (error, data) => {
        if (error)
            console.log(error);
        else {

        }
    }).promise();
    let listUser = giatri.Items;
    let listFriend = [];
    listUser.forEach((item) => {
        listFriend = item.friend_requests;
    });
    //   console.log("da vao 1");
    listFriend.forEach((item) => {
        console.log(item.idFriend + "da vao" + idfriend);
        if (item.idFriend == idfriend) {
            return res.json({ mess: "da gui yeu cau" });
        }
    })
    return res.json({ mess: "chua gui yeu cau" });
})
app.post("/api/huyKetBan", async (req, res) => {
    const id = req.body.id;
    const idfriend = req.body.idfriend;

    let itMeListFriend = await getByIdUser(req.body.id);
    let youListFriend = await getByIdUser(req.body.idfriend);

    let itMeItem;
    itMeListFriend.forEach((item) => {
        itMeItem = item;
    })

    let itYouItem;
    youListFriend.forEach((item) => {
        itYouItem = item;
    })

    itMeItem.friends.forEach((item, index, obj) => {
        if (item.idFriend == idfriend) {
            obj.splice(index, 1);
        }
    })

    itYouItem.friends.forEach((item, index, obj) => {
        if (item.idFriend == id) {
            obj.splice(index, 1);
        }
    })


    let params = {
        TableName: "UserOlaz",
        Key: {
            "id": id
        },
        UpdateExpression: "set friends= :friends",
        ExpressionAttributeValues: {
            ":friends": itMeItem.friends,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(params, (err, data) => {
        if (err) {
        }
    })

    let params2 = {
        TableName: "UserOlaz",
        Key: {
            "id": idfriend
        },
        UpdateExpression: "set friends= :friends",
        ExpressionAttributeValues: {
            ":friends": itYouItem.friends,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(params2, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        return res.json({ msg: "true" });
    })
});
getByIdUser = async (id) => {
    //const id = req.body.id;
    const params = {
        TableName: "UserOlaz",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        },
    };
    let giatri2 = await docClient.scan(params, (error, data) => {
        if (error)
            console.log(error);
        else {
            giatri = data.Items;
        }
    }).promise();
    return giatri2.Items;
}
app.post('/api/updateUser2', (req, res) => {
    const email = req.body.email;
    const sdt = req.body.sdt;
    const id = req.body.id;
    const ten = req.body.ten;
    const pass = req.body.pass;
    let paramsUpdate = {};

    paramsUpdate = {
        TableName: "UserOlaz",
        Key: {
            "id": id
        },
        UpdateExpression: "set ten= :ten, sdt= :sdt, email= :email, pass= :pass",
        ExpressionAttributeValues: {
            ":ten": ten,
            ":sdt": sdt,
            ":email": email,
            ":pass": pass
        },
        ReturnValues: "UPDATED_NEW"
    }

    docClient.update(paramsUpdate, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        return res.json({ msg: "true" });
    })
})
app.post('/api/createGroup', async (req, res) => {
    const id = req.body.id;
    const groupName = req.body.groupName;
    const groupMembersID = req.body.groupMembers;
    let members = [];
    let user = await getByIdUser(id);
    user.forEach((item) => {
        members.push({ idUser: item.id, tenUser: item.ten, avatarUser: item.avatar, sdtUser: item.sdt, emailUser: item.email });
    })
    for (var i = 0; i < groupMembersID.length; i++) {
        // console.log(i)
        // console.log(groupMembersID[i])
        const groupMembers = await getByIdUser(groupMembersID[i]);
        groupMembers.forEach(async (user) => {
            members.push({ idUser: user.id, tenUser: user.ten, avatarUser: user.avatar, sdtUser: user.sdt, emailUser: user.email })
        })
    }
    // console.log('nguyendepzai======'+members) 
    const params = {
        TableName: "GroupOlaz",
        Item: {
            "id": uuidv1(),
            "group_name": groupName,
            "group_members": members,
            "messages": []
        }
    }
    docClient.put(params, (err, data) => {
        if (err) {
            return res.json({ msg: "false" });
        }
        return res.json({ msg: "true" });
    })
});
app.post('/api/groups', (req, res) => {
    const userId = req.body.id;
    const params_scan = {
        TableName: "GroupOlaz",
    };
    docClient.scan(params_scan, (err, data) => {
        if (err) {
            console.log("Loi khi scan", JSON.stringify(err, null, 2))
            res.send(err)
        }
        else {
            let groups = data.Items;
            // console.log(groups)
            let userGroups = [];
            groups.forEach((item) => {
                if (item.group_members != "") {
                    let members = item.group_members;
                    members.forEach((element) => {
                        if (element.idUser == userId) {
                            // console.log(element.idUser)
                            userGroups.push(item)
                            // console.log(userGroups)
                        }
                    })
                } else {
                    console.log('null')
                }
            })
            res.send(JSON.stringify({ response: userGroups }))
        }
    })
});
getGroupByIdUser = async (id) => {
    //const id = req.body.id;
    const params = {
        TableName: "GroupOlaz",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        },
    };
    let giatri2 = await docClient.scan(params, (error, data) => {
        if (error)
            console.log(error);
        else {
            giatri = data.Items;
        }
    }).promise();
    return giatri2.Items;
}
app.post("/api/outgroup", async (req, res) => {
    const id = req.body.id;
    const idGroup = req.body.idGroup;
    let group = await getGroupByIdUser(req.body.idGroup);
    let myGroup;
    group.forEach((item) => {
        myGroup = item;
    })
    console.log(myGroup)
    myGroup.group_members.forEach((item, index, obj) => {
        if (item.idUser == id) {
            obj.splice(index, 1);
        }
    })
    console.log(myGroup)
    let params = {
        TableName: "GroupOlaz",
        Key: {
            "id": idGroup
        },
        UpdateExpression: "set group_members= :group_members",
        ExpressionAttributeValues: {
            ":group_members": myGroup.group_members,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(params, (err, data) => {
        if (err) {
            console.log("Loi khi update: ", JSON.stringify(err, null, 2))
            return res.json({ msg: "false" });
        }
        return res.json({ msg: "true" });
    })
});
app.post('/api/updateGroup', async (req, res) => {
    const idGroup = req.body.idGroup;
    const groupMembersID = req.body.groupMembers;
    const groupName = req.body.groupName;
    let members = []
    const params_scan = {
        TableName: "GroupOlaz",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": idGroup
        },
    };
    docClient.scan(params_scan, async (err, data) => {
        if (err) {
            console.log("Loi khi scan", JSON.stringify(err, null, 2))
            res.send(err)
        }
        else {
            let group = data.Items;
            
            group.forEach((item) => {
                item.group_members.forEach((mem) => {
                    members.push(mem)
                    
                })
            })
            for (var i = 0; i < groupMembersID.length; i++) {
                const groupMembers = await getByIdUser(groupMembersID[i]);
                groupMembers.forEach(async (user) => {
                    members.push({ idUser: user.id, tenUser: user.ten, avatarUser: user.avatar, sdtUser: user.sdt, emailUser: user.email })
                })
            }
            // console.log(members) 
            const paramsUpdate = {
                TableName: "GroupOlaz",
                Key: {
                    "id": idGroup
                },
                UpdateExpression: "set group_members= :group_members, group_name= :group_name",
                ExpressionAttributeValues: {
                    ":group_members": members,
                    ":group_name": groupName
                },
                ReturnValues: "UPDATED_NEW"
            }
            docClient.update(paramsUpdate, (err, data) => {
                if (err) {
                    return res.json({ msg: "false" });
                }
                return res.json({ msg: "true" });
            })
        }
    })
})
/*----------------------------------Messages MODULE 03 ------------------------------------------------------- */
// api add messages to friend
app.post('/api/addMessageToFriend', async (req, res)=>{
    const id = req.body.id;
    const listMessage_update = req.body.listMessage_Tam;
    const paramsUpdate = {
        TableName: "UserOlaz",
        Key: {
            "id": id
        },
        UpdateExpression: "set messages= :messages",
        ExpressionAttributeValues: {
            ":messages": listMessage_update,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(paramsUpdate,(err,data)=>{
        if(err){
            console.log(err)
        }
    })
});

app.post('/api/addMessageToGroup', async (req, res)=>{
    const id = req.body.id_group_conversation_click;
    const listMessage_update = req.body.list_all_message_tam_submit;
    const paramsUpdate = {
        TableName: "GroupOlaz",
        Key: {
            "id": id
        },
        UpdateExpression: "set messages= :messages",
        ExpressionAttributeValues: {
            ":messages": listMessage_update,
        },
        ReturnValues: "UPDATED_NEW"
    }
    docClient.update(paramsUpdate,(err,data)=>{
        if(err){
            console.log(err)
        }
    })
});

