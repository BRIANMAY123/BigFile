import { WorkerPool } from "./workerPool";
import { WorkerWrapper } from "./workerWrapper";

class WorkerPoolForMd5 extends WorkerPool{
    constructor(maxWorkerCount:number){
        super(maxWorkerCount);
        this.pool=Array.from({length:maxWorkerCount}).map(
            
            ()=>new WorkerWrapper(new Worker(new URL('./md5.worker.ts',import.meta.url),{type:'module'}))
        )
    }
}

export {WorkerPoolForMd5}