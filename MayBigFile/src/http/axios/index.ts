import axios, { AxiosRequestConfig } from "axios"



const baseConfig={
    baseURL: 'http://localhost:8080',
    //timeout:20000
}

const instance=axios.create(baseConfig);
function http(params:AxiosRequestConfig){
    return instance({...params}).then(res=>{
        if(res&&res.status===200){
            return Promise.resolve(res.data)
        }else{
            return Promise.reject(res)
        }
    })
}

function httpGet(url:string){
    return http({
        url,
        method:'get'
    })
}
function httpPost(url:string,data?:any,otherConfig?:AxiosRequestConfig){
    return http({
        url,
        method:'post',
        data,
        ...otherConfig
    })
}

export {
    httpGet,
    httpPost
}