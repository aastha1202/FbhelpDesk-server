const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    message: String,
    id: String,
    from: {
        name: String,
        email: String,
        id: String
    }
});


const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
