import { useRef,useState,useEffect } from "react";
import { CHUNK_SIZE } from "../constant";
import { httpGet, httpPost } from "../http/axios";
import { useDrag } from "../hook/useDrag";
import "./file.scss";
import { WorkerService } from "../webWorker/workerService";
import { PromisePool } from "../promisePool";
import { message,Button } from "antd";
import axios, { CancelTokenSource,AxiosProgressEvent } from 'axios';
import { Progress } from "antd";



const File = () => {
  const uploadRef = useRef(null);
  const { selectedFile, filePreview } = useDrag(uploadRef);
  const [cancelToken,setCancelToken]=useState<CancelTokenSource[]>([]);
  //记录每个chunk的进度
  const [chunkProgress,setChunkProgress]=useState<Record<string,number>>({});
  //记录整个文件的进度
  const [progress,setProgress]=useState(0);


  const renderProgress=()=>{
    return (
      <div>
        <Progress percent={progress} />
      </div>
    )
  }


  useEffect(()=>{
    if (!selectedFile) return;
    const totalProgress=Object.keys(chunkProgress).reduce((acc,key)=>{
      //debugger
      const totalProgress=acc+(chunkProgress[key]||0)
      return totalProgress
    },0);
    const percent=Math.ceil(totalProgress/selectedFile.size)
    if(selectedFile){
      console.log(percent);
      setProgress(percent)
    }else{
        setProgress(0)
      }
   
  },[chunkProgress,selectedFile])

  //将文件切片并且变成arrayBuffer
  const sliceFileChunk = (file: File): Blob[] => {
    const count = Math.ceil(file.size / CHUNK_SIZE);
    let chunks = [];
    for (let i = 0; i < count; i++) {
      let start = i * CHUNK_SIZE;
      let end;
      if (file.size - start < CHUNK_SIZE) {
        end = file.size;
      } else {
        end = (i + 1) * CHUNK_SIZE;
      }
      let chunk = file.slice(start, end);
      chunks.push(chunk);
    }
    //debugger
    return chunks;
  };
  const getArrayBufferFromBlob = (chunks:Blob[]): Promise<ArrayBuffer[]> => {
    return Promise.all(
      chunks.map((item: Blob) => {
        return item.arrayBuffer();
      })
    );
  };

  const createRequest = (chunk: Blob,chunkHashName:string,index:number,start:number,cancelToken:CancelTokenSource,) => {
    return async () => {
       
      const res  = httpPost("/upload/a", chunk, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
        params:{
            chunkFileName: chunkHashName,
            start,
            index
        },
        cancelToken:cancelToken.token,
        onUploadProgress: (progressEvent:AxiosProgressEvent) => {
          //debugger
          const percentCompleted=Math.round(progressEvent.loaded*100);
          setChunkProgress((prev)=>{
            return {
              ...prev,
              [chunkHashName]:percentCompleted}
          })
          //console.log(progressEvent)
        }
      });
      return res;
    };
  };
  const computedHash=async ()=>{
    const chunks =  sliceFileChunk(selectedFile as File);
    const workerPool = new WorkerService();
    let res1 = await getArrayBufferFromBlob(chunks);
  ///debugger
    const hashpool = await workerPool.getMd5WorkerPool(res1);
    const hashWrapper=chunks.map((chunk:Blob,index:number)=>{
      return {
        chunk,
        index,
        chunkFileName:hashpool[index]
      }
    })

    return hashWrapper

  }

  const uploadFile = async () => {
    //debugger
    //const [needUpload,uploadChunkList]=await httpGet('verify/a');
    const uploadChunkList=[];
    // if(!needUpload){
    //   message.info('文件已存在');
    //   return;
    // }

    // const chunks = await sliceFileChunk(selectedFile as File);
    
    // const workerPool = new WorkerService();
    
    // let res1 = await getArrayBufferFromBlob(chunks);

    // const hashpool = await workerPool.getMd5WorkerPool(res1);

    const hashWrapper=await computedHash();
    

    const newCancelTokens:CancelTokenSource[]=[]
    const requests = hashWrapper.map(({chunk,index,chunkFileName}) => {
      const cancelToken=axios.CancelToken.source();
      newCancelTokens.push(cancelToken)
      const existChunk= uploadChunkList.find((uploadedFile)=>{
        return uploadedFile.chunkFileName=chunkFileName
      })
  
      if(existChunk){
        const uploadedSize=existChunk.size;
        const remainingChunk=chunk.slice(uploadedSize);
        if(remainingChunk.size===0){
          return ()=>{Promise.resolve()}
        }
        return createRequest(remainingChunk,chunkFileName,index,uploadedSize,cancelToken)
      }else{
        return createRequest(chunk,chunkFileName,index,0,cancelToken)
      }
      
    });
    setCancelToken(newCancelTokens)

    //debugger
   

    const promisePool = new PromisePool(requests);
    try{
      await promisePool.execute();
      //发请求合并
    }catch(e){

    }
   
  };

  return (
    <div>
      <div className="uploadContainer" ref={uploadRef}>
        111111111
      </div>
      <Button onClick={uploadFile} type="primary">上传</Button>
      {renderProgress()}
    </div>
  );
};

export { File };
