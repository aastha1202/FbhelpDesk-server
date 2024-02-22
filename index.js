const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cors = require('cors')
const axios = require('axios')
const {Message} = require('./model')
dotenv.config()

const app = express()
app.use(cors())
const port = 3000

app.use(bodyParser.json())

const mongoURI = process.env.MONGODB_URI;
const pageId = process.env.FACEBOOK_PAGE_ID;

app.post('/get-page-access-token', (req,res)=>{
    const {userAccessToken} = req.body
    fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${userAccessToken}`)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      const pageAccessToken = data.access_token;
      res.json({ pageAccessToken });
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
})

app.post('/get-page-messages', (req,res)=>{
    const {pageAccessToken} = req.body
    fetch(`https://graph.facebook.com/v19.0/me/conversations/messages?fields=messages{message,id,from},senders&access_token=${pageAccessToken}`)
    .then(response => response.json())
    .then(data => {
      data.data.forEach(async conversation => {
        conversation.messages.data.forEach(async messageData => {
            // Check if message with the same ID already exists
            const existingMessage = await Message.findOne({ id: messageData.id });
            if (!existingMessage) {
                const message = new Message({
                    message: messageData.message,
                    id: messageData.id,
                    from: messageData.from
                });
                await message.save();
            }
        });
    });
      res.json({ data: data.data});
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
})

app.post('/messages', (req,res)=>{
    const {id, message, pageAccessToken} = req.body
    const requestBody = {
        recipient: {
            id: id
        },
        message: {
            text: message
        }
    };
    console.log(requestBody)
    axios.post(`https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`,requestBody)
    .then(response => {
    res.json({ data: response.data })
  })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
})

mongoose.connect(mongoURI).then(()=> {
    console.log('connected to mongoose')
}).catch((err)=> {
    console.log(err)
})

app.listen(port,()=>{
 console.log(`Server is running at ${port}`)
})