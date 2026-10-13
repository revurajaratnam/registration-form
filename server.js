
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});
app.post("/api/users",upload.none(),(req,res)=>{
    console.log(req.body);
    console.log(req.params);
    console.log(req.headers);

    res.json({message:"success",data:req.body});
})
app.get("/api/users",(req,res)=>{
    res.json({message:"success"});
});
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
  });

// async function startServer() {
//   try {
//     await mongoose.connect(
//       "mongodb://127.0.0.1:27017/registrationDB"
//     );

//     console.log("MongoDB connected");

  
//   } catch (error) {
//     console.error("MongoDB connection failed:", error.message);
//   }
// }

// startServer();
