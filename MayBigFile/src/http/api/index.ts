import { httpPost,httpGet } from "../axios";

const sendDemoTest= async()=>{
    const url='/test';
    const result=await httpGet(url);
    return result
}

export {sendDemoTest}