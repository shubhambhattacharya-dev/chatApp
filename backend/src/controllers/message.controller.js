import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../lib/util/cloudinary.js';

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId=req.user._id;
        const filteredUsers=await User.find({_id:{$ne:loggedInUserId}}).select('username fullName profilePic isOnline lastSeen -password');
        res.status(200).json({success:true,users:filteredUsers});

    } catch (error) {
        console.log('Error in getUsersForSidebar:', error);
        res.status(500).json({success:false,message:'Server Error'});

    }
}

export const getMessagesBetweenUsers=async(req,res)=>{
    try {
        const {id:userToChatId}=req.params;
        const myId=req.user._id;

        const messages=await Message.find({
            $or:[{
                senderId:myId, receiverId:userToChatId
            },{
                senderId:userToChatId, receiverId:myId

            }]
        })
        .sort({createdAt:1});

        res.status(200).json({success:true,messages});

    } catch (error) {
        console.log('Error in getMessagesBetweenUsers:', error);
        res.status(500).json({success:false,message:'Internal getmessagesServer Error'});

    }
}

export const sendMessage=async(req,res)=>{
    try {
        const {text,image,file}=req.body;
        const {id:receiverId}=req.params;
        const senderId=req.user._id;

        let imageUrl;
        if(image){
            // Logic to upload image and get URL
            const uploadedImage=await cloudinary.uploader.upload(image,{
                folder:'chatApp/images',
                resource_type:'image'
            });
            imageUrl=uploadedImage.secure_url;
        }

        let fileUrl;
        if(file){
            // Logic to upload file and get URL
            const uploadedFile=await cloudinary.uploader.upload(file,{
                folder:'chatApp/files',
                resource_type:'raw'
            });
            fileUrl=uploadedFile.secure_url;
            
        }

        const newMessage=new Message({
            senderId,
            receiverId,
            message:text,
            messageType:image?'image':file?'file':'text',
            fileUrl:fileUrl || imageUrl || ''
        });

        await newMessage.save();

        res.status(200).json({
            success:true,
            message:'Message sent successfully'
        })

        //realtime functionality with socket.io can be added here 
        //TODO: emit socket event to receiver about new message and 
        
    } catch (error) {
        console.log('Error in sendMessage:', error);
        res.status(500).json({success:false,message:'Internal sendMessage Server Error'});
        
    }
}