import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/util/generateToken.js';


export const signup=async(req,res)=>{
    const  {fullName,email,password} =req.body
    try {

if(!fullName||!email||!password){
        return res.status(400).json({message:'please provide all required fields'});
    } 

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
            username: fullName, // Map fullName to username since model requires it
            fullName,
            email,
            password:hashedPassword
        })

        if(newUser){
            //generate token jwt 
            generateToken(newUser._id,res);
          
            await newUser.save();
            res.status(201).json({
                _id:newUser._id,
                username: newUser.username,
                fullName:newUser.fullName,
                email:newUser.email,
                lastSeen:newUser.lastSeen,
                profilePic:newUser.profilePic,
                isOnline:newUser.isOnline


            })

        }else{
            return res.status(400).json({message:'invalid user data'});

        }
        
    } catch (error) {
        console.error("error in signup controller:",error.message);
        res.status(500).json({message:'Internal server error'});

        
    }
    
}

export const login=async(req,res)=>{
    res.json({message:'login controller'});
}

export const logout=async(req,res)=>{
    res.json({message:'logout controller'});
}

export default{signup,login,logout};