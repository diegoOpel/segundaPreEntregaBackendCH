import express, { urlencoded } from 'express';
import __dirname from './utils.js';
import handlebars from 'express-handlebars';
import viewsRouter from './routes/views.router.js';
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import { messagesModel } from "./dao/models/messages.model.js"
import chatRouter from './routes/chat.router.js';
import cartRouter from './routes/cart.router.js';

const app = express();
const PORT = 8080
const httpServer = app.listen(PORT, ()=>console.log("Server listening on Port 8080"))
const io = new Server(httpServer);
app.use(express.json())
app.use(urlencoded({extended:true}))
app.engine('handlebars',handlebars.engine())
app.set('views',__dirname+"/views")
app.set('view engine','handlebars')
app.use(express.static(__dirname+"/public"))
app.use('/chat',chatRouter)
app.use("/cart",cartRouter)
app.use("/",viewsRouter)
mongoose.connect('mongodb+srv://diegoopel:MA6Csbb7k3MscxhE@cluster0.rccgf6w.mongodb.net/?retryWrites=true&w=majority')

io.on('connection', async socket=>{
  console.log("Nuevo cliente conectado")
  try{
    let messages = await messagesModel.find().lean()
    io.emit('previousMessages', messages)
  }
  catch(error){
    console.log(error)
  }
  socket.on('message', async data=>{
    let {userMail, message} = data
    try{
      await messagesModel.create({userMail, message})
      let messages = await messagesModel.find().lean()
      io.emit('messageLogs', messages);
    }
    catch(error){
      console.log(error)
    }
  })
  socket.on('connectionMail', data =>{
    socket.broadcast.emit("newUser", data)
  })
})

