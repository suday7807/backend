import express from "express"
import path from "path"
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";


const app = express();


mongoose.connect("mongodb://localhost:27017",{dbname:"backend",}).then(()=>console.log("Database Connected")).catch((e)=>console.log(e));

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
});



const User = mongoose.model("User", userSchema);

app.set("view engine","ejs")

app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


const isAuthenticated = async (req,res,next)=>{
    const { token } = req.cookies;
    if(token){


        const decoded =jwt.verify(token,"nmkjlhnkjfghkjfglikj");
        req.user = await User.findById(decoded._id);


        next();
    }
    else{
        res.render("login");
    }
}

app.get("/",isAuthenticated,(req, res)=>{
    res.render("logout",{name:req.user.name});
    console.log(req.user)
})



app.post("/login", async(req,res)=>{

    const {name, email} = req.body;
    const user = await User.create({name, email});


    

    const token = jwt.sign({_id:user._id}, "nmkjlhnkjfghkjfglikj");


    res.cookie("token", token,{httpOnly:true, expires:new Date(Date.now()+60*1000)});
    res.redirect("/");
});

app.get("/logout",(req,res)=>{
    res.cookie("token","null",{httpOnly:true, expires:new Date(Date.now())});
    res.redirect("/");
});





app.listen(4000, ()=>{
    console.log("Server is Working")
})