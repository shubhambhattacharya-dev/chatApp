//axios mean for making http requests and handling responses from the server , it simplifies the process of interacting with backend APIs by providing an easy-to-use interface for sending requests and receiving data. It also handles the conversion of data to and from JSON format, which is a common format for transmitting data over the network.  

//zustand is a small, fast and scalable bearbones state-management solution using simplified flux principles. It provides a minimalistic API for managing application state in a predictable way, making it easy to create and maintain complex applications with a clear separation of concerns.

import axios from 'axios';

export const axiosInstance=axios.create({
    baseURL:"http://localhost:8000/api",
    withCredentials:true, //to include cookies in cross-origin requests

})