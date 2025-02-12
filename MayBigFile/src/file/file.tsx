import { useRef } from "react";
import { CHUNK_SIZE } from "../constant";
import { httpPost } from "../http/axios";
import { useDrag } from "../hook/useDrag";
import "./file.scss";
import { WorkerService } from "../webWorker/workerService";
import { PromisePool } from "../promisePool";
import { asyncFunctions } from "../mock";


const File = () => {
  const uploadRef = useRef(null);
  const { selectedFile, filePreview } = useDrag(uploadRef);

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
  const getArrayBufferFromBlob = (chunks): Promise<ArrayBuffer[]> => {
    return Promise.all(
      chunks.map((item: Blob) => {
        return item.arrayBuffer();
      })
    );
  };

  const createRequest = (chunk: Blob,index:number,chunkHashName:string) => {
    return () => {
       
      const res = httpPost("/demo", chunk, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
        params:{
            index,
            chunkHashName
        }
      });
      return res;
    };
  };

  const uploadFile = async () => {
    
    const chunks = await sliceFileChunk(selectedFile as File);
    
    const workerPool = new WorkerService();
    
    let res1 = await getArrayBufferFromBlob(chunks);
    ///debugger
    
    const hashpool = await workerPool.getMd5WorkerPool(res1);
    //console.log(a);
    //debugger

    // getArrayBufferFromBlob(chunks).then((res)=>{
    //     workerPool.getMd5WorkerPool(res)
    // })
    
    const requests = chunks.map((chunk, index) => {
      return createRequest(chunk,index,hashpool[index]);
    });
     //debugger
    // const promisePool = new PromisePool(asyncFunctions);
    // await promisePool.execute()

    const promisePool = new PromisePool(requests);
    const res = await promisePool.execute();
    // console.log(res);
  };

  return (
    <div>
      <div className="uploadContainer" ref={uploadRef}>
        111111111
      </div>
      <button onClick={uploadFile}>上传</button>
    </div>
  );
};

export { File };
