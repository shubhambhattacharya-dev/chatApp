export const signup=async(req,res)=>{
    res.json({message:'signup controller'});
}

export const login=async(req,res)=>{
    res.json({message:'login controller'});
}

export const logout=async(req,res)=>{
    res.json({message:'logout controller'});
}

export default{signup,login,logout};