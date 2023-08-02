const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const ObjectId = mongoose.Types.ObjectId;
const mongodb = require("mongodb");
const dotenv = require('dotenv').config();
const app = express();
const PORT = 4000;
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')


app.use(cors());
// 'mongodb://127.0.0.1:27017/db-drag-drop'
// Kết nối tới MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Đã kết nối thành công tới MongoDB!');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
  }
})();

// User

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  title:String,
  role: String,
});

const User = mongoose.model('Users', userSchema);
app.use(bodyParser.json());
app.use(cors());
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ error: 'Đã có lỗi xảy ra khi lấy dữ liệu.' });
  }
});

app.post('/api/create-users', async (req, res) => {
  const { email, password, title } = req.body;
  console.log(email, password, title)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newItem = new User({ email: email, password: hashedPassword, title: title});
  try {
    const savedItem = await newItem.save();
    res.json(savedItem);
    console.log("Add item success")
  } catch (error) {
   
  }
});

app.post('/api/login', async (req, res) =>{
  const { email, password } = req.body;
  console.log(email, password)
    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(500).json("Không tìm thấy người dùng");
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(500).json("Mật khẩu không đúng");
      }
      res.json("thành công");
    } catch (e) {
      //  console.log(error);
    }
})



// App
// const Schema = mongoose.Schema;

const boxSchema = new Schema({
  // _id: {
  //   type: mongoose.Schema.Types.ObjectId, // Sử dụng mongoose.Schema.Types.ObjectId
  //   required: true,
  // },
  name: String,
  options: [String],
  items:[String],
  author: String,
});
const BoxModel = mongoose.model('App', boxSchema);

app.use(bodyParser.json());
app.use(cors());

app.get('/list-app', async (req, res) => {
  try {
    const lists = await BoxModel.find();
    res.json(lists); 
  } catch (error) {
    console.error('Lỗi khi lấy danh sách app:', error);
    res.status(500).json({ error: 'Đã có lỗi xảy ra khi lấy dữ liệu app.' });
  }
});


 
app.delete('/api/delete-app/:id', (req, res) => {
  const itemId = req.params.id;
  
  const itemObjectId = new mongodb.ObjectId(req.params.id);
  console.log(itemId, "---", itemObjectId);
  BoxModel.deleteOne(new mongodb.ObjectId(req.params.id))
    .then(deletedItem => {
      if (!deletedItem) {
        return res.status(404).json({ error: 'App not found' });
      }
      console.log('App deleted:', deletedItem);
      res.status(200).json({ message: 'App deleted successfully' });
    })
    .catch(err => {
      console.error('Error deleting app:', err);
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.post('/api/create-box', (req, res) => {
  const { name, author } = req.body;
  const newBox = new BoxModel({  name: name, author: author });

  newBox.save()
    .then(savedBox => {
      console.log('Box saved:', savedBox);
      res.status(200).json({ message: 'Box created successfully', box: savedBox });
    })
    .catch(error => {
      console.error('Error saving box:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });

  });

// add user of app

app.post('/api/saveData', (req, res) => {
  const { itemId, options } = req.body;
  console.log(itemId);
  const itemObjectId = new ObjectId(itemId);
  BoxModel.findOneAndUpdate(
    { _id: itemObjectId },
    { $push: { options: { $each: options } } },
    { new: true }
  )
    .then(modal => {
      console.log('User data updated:', modal);
      res.status(200).json({ message: 'Modal data updated successfully' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});


app.post('/api/saveItemDrop', (req, res) => {
  const { itemId, items } = req.body;
  console.log(itemId, "/", items);
  const itemObjectId = new ObjectId(itemId);

  BoxModel.findOneAndUpdate(
    { _id: itemObjectId },
    { $set: { items: [] } }, // Đặt items thành một mảng rỗng trước khi thêm dữ liệu mới
    { new: true }
  )
    .then(() => {
      // Tiếp theo, thêm dữ liệu mới vào items
      return BoxModel.findOneAndUpdate(
        { _id: itemObjectId },
        { $push: { items: { $each: items } } },
        { new: true }
      );
    })
    .then(modal => {
      console.log('User data updated:', modal);
      res.status(200).json({ message: 'Modal data updated successfully' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});


// Items

const itemUser = new mongoose.Schema({
  id: Schema.Types.ObjectId,
  name: String,
  description: String,
  sample1: String,
  sample2: String,
  label: String,
  inside: Schema.Types.ObjectId,
});
const Item = mongoose.model('Items', itemUser);

app.post('/api/create-item', async (req, res) => {
  const { name, description, sample1, sample2, label, inside } = req.body;
  const newItem = new Item({ name, description, sample1, sample2, label, inside });

  try {
    const savedItem = await newItem.save();
    res.json(savedItem);
    console.log("Add item success")
  } catch (error) {
    res.status(500).json({ error: 'Có lỗi xảy ra khi lưu tài liệu.' });
  }
});


app.get('/list-item', async (req, res) => {
  try {
    const lists = await Item.find();
    res.json(lists); 
    console.log("Get item success")
  } catch (error) {
    console.error('Lỗi khi lấy danh sách item:', error);
    res.status(500).json({ error: 'Đã có lỗi xảy ra khi lấy dữ liệu item.' });
  }
});

 
app.delete('/api/delete-try/:id', (req, res) => {
  const itemId = req.params.id;
  
  const itemObjectId = new mongodb.ObjectId(req.params.id);
  console.log(itemId, "---", itemObjectId);
  Item.deleteOne(new mongodb.ObjectId(req.params.id))
    .then(deletedItem => {
      if (!deletedItem) {
        return res.status(404).json({ error: 'Item not found' });
      }
      console.log('Item deleted:', deletedItem);
      res.status(200).json({ message: 'Item deleted successfully' });
    })
    .catch(err => {
      console.error('Error deleting item:', err);
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});





app.listen(PORT, () => {
  console.log(`Server đang lắng nghe tại http://localhost:${PORT}`);
});
