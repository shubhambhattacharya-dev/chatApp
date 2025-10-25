//why need this file? beacuse we are using zustand for state management and this file will help us to create a store for authentication state management.

import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';

export const useAuthStore=create((set)=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpatingProfile:false,

    ischeckingAuthLoading:true,
    checkAuth:async()=>{
        try {
            const res=await fetch("http://localhost:8000/api/auth/check-auth",{
                method:"GET",
                withcredentials:true, // Include cookies in the request
            });
            set({authUser:res.data});
        } catch (error) {
            console.log("error in check auth",error);
            set({authUser:null});
        }finally{
            set({ischeckingAuthLoading:false});

            
        }
    }

    
}));