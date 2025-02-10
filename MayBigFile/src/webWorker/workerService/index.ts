import { WorkerPoolForMd5 } from "../workerPool/workerPoolForMd5";

class WorkerService{
    private md5WorkerPool:WorkerPoolForMd5;

    constructor(){
            this.md5WorkerPool=new WorkerPoolForMd5(4);
    }

    getMd5WorkerPool(chunks:ArrayBuffer[]){
        
        return this.md5WorkerPool.exec(chunks);
    }
       
}

export {WorkerService}
