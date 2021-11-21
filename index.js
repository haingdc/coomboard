const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const cors = require('cors')

const mongoose = require('mongoose');
const { SchemaTypes, Schema } = mongoose;

// DB connection
mongoose
  .connect("mongodb+srv://admin:admin@cluster0.8imrt.mongodb.net/coomboard?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then(() => {
    console.log("CONNECTED TO DATABASE");
  });

const Todoschema=new mongoose.Schema({
  todo:{
      type:String,
      required:true,
  },
  email_:{
      type:String,
      required: true,
        },
  done:{
      type:String,
      required: true,
  }
});

const TaskSchema = new mongoose.Schema({
  content: { type : String, required: true },
});

const ColumnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  taskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

const ColumnOrderSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Column' }
}, { _id: false } );


const Task_model = mongoose.model('Task', TaskSchema);
const Column_model = mongoose.model('Column', ColumnSchema);
const Column_Order_model = mongoose.model('Column_Order', ColumnOrderSchema);

const Todo_model =new mongoose.model("Todo",Todoschema);
const router = express.Router();

router.get('/collection/columns/add', async (req, res) => {
  const { column } = req.query;
  const newColumn = new Column_model({ title: column });
  if (!column) {
    res.redirect('/');
  }

  try {
    const column = await newColumn.save();
    const newColumnOrder = new Column_Order_model({ _id: column._id });
    await newColumnOrder.save();
    res.json({
      message: 'success',
      column,
    })
  } catch(err) {
    console.log(err)
    res.send({ err })
  }
});

router.get('/collection/column_order', async (req, res) => {
  try {
    const column_order = await Column_Order_model.find({});
    res.json(column_order)
  } catch(err) {
    console.log(err);
    res.send({ err })
  }
});

router.get('/collection/columns', async (req, res) => {
  try {
    const columns = await Column_model.find({});
    res.json(columns)
  } catch(err) {
    console.log(err);
    res.send({ err })
  }
});



router.get('/collection/tasks/add', (req, res) => {
  const { content } = req.query;
  const newTask = new Task_model({ content: content });
  if (!column) {
    res.redirect('/');
  }
  newTask.save()
    .then(() => {
      console.log('done')
      res.send({ message: 'success'})
    })
    .catch(err => console.log(err))
});



router.get('/add/todo', (req, res) => {
  debugger
  const {todo, email}=req.query;
  const newTodo=new Todo_model({todo,email_: email,done:"0"})
  if(todo==""){
      res.redirect('/')
  }
  newTodo.save()
  .then(()=>{
      console.log("done")
      res.redirect('/')
  })
  .catch(err=>console.log(err))
});

router.get("/delete/todo/:_id",(req,res)=>{
  const {_id}=req.params;
  Todo_model.deleteOne({_id})
  .then(()=>{
      console.log("deleted")
      res.redirect('/')
  })
  .catch((err)=>console.log(err));
});

router.get("/update/todo/:_id",(req,res)=>{
  const {_id}=req.params;
  const info=Todo_model.find();
  console.log(info)
  Todo_model.updateOne({_id}, { done:"1"})
  .then(()=>{
      console.log("deleted")
      res.redirect('/')
  })
  .catch((err)=>console.log(err));
});

/*
    Incase you are using mongodb atlas database uncomment below line
    and replace "mongoAtlasUri" with your mongodb atlas uri.
*/
// mongoose.connect( mongoAtlasUri, {useNewUrlParser: true, useUnifiedTopology: true})
app.use(cors());

app.use(router)

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ message:"API Still Working Fine (-_-)!" });
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})