const express = require("express");
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

//Extracting hidden information in the .env file
const secret = process.env.TOKEN_SECRET;
const port = process.env.PORT;

app.use(cookieParser());
//able to use the below to generate a system generated secret for added security
//note that the secret used cant be too simple
//require('crypto').randomBytes(64).toString('hex')

//function for generating a token for the user
function generateAccessToken(userinformation){
    const {username,pwd} = userinformation;
    return jwt.sign({"username":username,"pwd":pwd},secret,{expiresIn:"1800s"})

}

//Authenticating the user whether they are valid using function middleware 
async function authenticateToken(req,res,next){
    //usually when you generate a token the token will be stored in the header og the request
    const authHeader =  req.headers['authorization'];
    //since the content in the header is "bearer JWT_TOKEN"
    //we need to extract out the token itself 
    const token = authHeader.split(" ")[1];
    if(token===null){
        res.status(401).json({
            success:false
        })
    }
    //verify the token 
    const decode = await jwt.verify(token,secret,(err,decoded)=>{
        if(err){
            //if any error
            return res.status(403).json({
                success:false,
                errormsg:err
            })
        }
    })
    // will proceed on with the request if there is no error and will return and pass to the next middleware 
    next();
}

//route for the new user to sign up
app.post("/api/createNewUser",(req,res)=>{
    const informationClient = {...req.body};
    const token = generateAccessToken(informationClient);
    //here for the parsing of the cookie
    console.log(token);
    res.cookie('token', token);
    return res.json(token);
})
//route with sensitive information (just an example)
app.get("/api/secretInformation",authenticateToken,(req,res)=>{

    //send user the response of my secret
    res.send("The secret is i love cars!")
})


app.get("/checkCookies",(req,res)=>{
    const cookie = req.cookies.token;
    if(cookie){
        console.log(cookie)
    }else{
        console.log("no token is to be found anywhere u fuck tart")
    }
})

app.listen(port,()=>{
    console.log(`Listening on port ${port}............`);
})
