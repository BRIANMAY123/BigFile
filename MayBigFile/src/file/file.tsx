import { CHUNK_SIZE } from "../constant"

const File=()=>{
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


    return(
        <div></div>
    )
}