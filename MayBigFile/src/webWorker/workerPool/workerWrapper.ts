import { workerLabel } from "../../type/worker-labels";
import { WorkerRep } from "../workerMessage";

export enum StatusEnum {
    RUNNING = 'running',
    WAITING = 'waiting',
  }

class WorkerWrapper{
    worker:Worker
    status:StatusEnum
    constructor(worker:Worker){
        this.worker=worker;
        this.status=StatusEnum.WAITING
    }

    public run(param: ArrayBuffer, params: ArrayBuffer[], index: number){
        this.status=StatusEnum.RUNNING;
        return new Promise((res,rej)=>{
            this.worker.onmessage=({data}:WorkerRep<{ result: string; chunk: ArrayBuffer }>)=>{
                const {label,content}=data;
                if(label===workerLabel.DONE&&content){
                    params[index]=content.chunk;
                    this.status = StatusEnum.WAITING
                    res(content.result)
                }
            }
            this.worker.onerror=(e)=>{
                this.status=StatusEnum.WAITING;
                rej(e)
            }
            this.worker.postMessage(param,[param])
        })
    }
}

export {WorkerWrapper}