let express = require('express');
let router = express.Router();
let { CheckLogin } = require('../utils/authHandler')
let { uploadImage } = require('../utils/uploadHandler')
let userSchema = require('../schemas/users')
let messageSchema = require('../schemas/messages')


router.post('/', CheckLogin, uploadImage.single('file'), async function (req, res, next) {
    let from = req.user._id;
    let to = req.body.to;
    let userTo = await userSchema.findById(to);
    if (!userTo) {
        res.status(404).send("user den khong ton tai")
        return;
    }
    let message = {}
    if (req.file) {
        message.type = 'file';
        message.text = req.file.path
    } else {
        message.type = 'text';
        message.text = req.body.text
    }
    let newMess = new messageSchema({
        from: from,
        to: to,
        messageContent: message
    })
    await newMess.save();
    res.send(newMess)
})
router.get('/:userId', CheckLogin, async function (req, res, next) {
    let user1 = req.user._id;
    let user2 = req.params.userId;
    let getUser2 = await userSchema.findById(user2);
    if (!getUser2) {
        res.status(404).send("user den khong ton tai")
        return;
    }
    let message = await messageSchema.find({
        $or: [{
            from: user1,
            to: user2
        }, {
            to: user1,
            from: user2
        }]
    }).sort({
        createdAt: -1
    }).populate('from to')
    res.send(message)
})

router.get('/', CheckLogin, async function (req, res, next) {
    let user1 = req.user._id;
    let messages = await messageSchema.find({
        $or: [{
            from: user1
        }, {
            to: user1
        }]
    }).sort({
        createdAt: -1
    })
    let messageMap = new Map();
    user1 = user1.toString();
    for (const message of messages) {
        let keyUser = user1 == message.from.toString() ? message.to.toString() : message.from.toString();
        if (!messageMap.has(keyUser)) {
            messageMap.set(keyUser, message)
        }
    }
    let result = [];
    messageMap.forEach(function (value, key) {
        result.push({
            user: key,
            message: value
        })
    })
    res.send(result)
})

module.exports = router;