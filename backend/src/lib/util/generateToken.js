
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

export const generateToken=(userId,res)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:'7d',
    });
    //cookie options
    res.cookie("jwt",token,{
        //maxage
        maxAge:7*24*60*60*1000,
        httpOnly:true,//accessible only by web server and not js and prevent cross site scripting attacks xss
        sameSite:"strict",//csrf protection , csrf attacks mean unauthorized commands are transmitted from a user that the web application trusts
        secure:process.env.NODE_ENV==='production',//https only in production

    })
    return token;
}