import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';


export const signup=async(req,res)=>{
    const  {fullName,email,password} =req.bodyl
    try {
        // for hashing password from bcryptjs
        if(password.length<6){
            return res.status(400).json({
                message:'password must be at least 6 charachters'
            })
        }

        const user=await User.findOne({email})

        if(user)return res.status(400).json({message:'user already exists'});

        //hashing password
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt)

        //newUser 

        const newUser=new User({
            fullName,
            email,
            password:hashedPassword
        })

        if(newUser){
            //generate token jwt 

        }else{
            return res.status(400).json({message:'invalid user data'});

        }
        
    } catch (error) {
        
    }
    
}

export const login=async(req,res)=>{
    res.json({message:'login controller'});
}

export const logout=async(req,res)=>{
    res.json({message:'logout controller'});
}

export default{signup,login,logout};