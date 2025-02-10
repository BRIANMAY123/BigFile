import { useRef } from "react";
import { CHUNK_SIZE } from "../constant"
import { httpPost } from "../http/axios"
import { useDrag } from "../hook/useDrag"
import './file.scss'
import { WorkerService } from "../webWorker/workerService";

const File=()=>{
    const uploadRef=useRef(null);
    const {selectedFile,filePreview}=useDrag(uploadRef);

    //将文件切片并且变成arrayBuffer
    const sliceFileChunk=(file:File):Blob[]=>{
        const count=Math.ceil(file.size/CHUNK_SIZE);
        let chunks=[];
        for(let i=0;i<count;i++){
            let start=i*CHUNK_SIZE;
            let end;
            if(file.size-start<CHUNK_SIZE){
                end=file.size
            }else{
                end=(i+1)*CHUNK_SIZE;
            }
            let chunk=file.slice(start,end);
            chunks.push(chunk)
        }
        return chunks
    }
    const getArrayBufferFromBlob=(chunks):Promise<ArrayBuffer[]>=>{
        return Promise.all(chunks.map((item:Blob)=>{
            return item.arrayBuffer()
        }))
    }

    const createRequest=(chunk:Blob)=>{
        return httpPost('/upload',chunks,
            {
                headers:{
                    'Content-Type':'application/octet-stream'
                }
            }
        
    )

    }
    
    const uploadFile=async()=>{
        //debugger
        const chunks=await sliceFileChunk(selectedFile as File);
        //debugger
        const workerPool=new WorkerService();
         let res1= await getArrayBufferFromBlob(chunks);
        // debugger
        const a=await workerPool.getMd5WorkerPool(res1)
        //console.log(a);
        
        // getArrayBufferFromBlob(chunks).then((res)=>{
        //     workerPool.getMd5WorkerPool(res)
        // })
        debugger
        const requests=chunks.map((chunk,index)=>{
            return createRequest(chunk)
        });
        const promisePool=new PromisePool({requests,index});
        const res=await promisePool.execute();
        console.log(res);

    }

    




    return(
        <div>
            <div className="uploadContainer" ref={uploadRef}>111111111</div>
            <button onClick={uploadFile}>上传</button>
        </div>
    )
}

export {File}