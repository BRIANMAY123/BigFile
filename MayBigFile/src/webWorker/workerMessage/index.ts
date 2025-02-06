import { workerLabel } from "../../type/worker-labels";

class WorkerMessage<T=any>{
    label:workerLabel;
    content?:T;
    constructor(label:workerLabel,content?:T){
        this.label=label;
        this.content=content

    }
}

export interface WorkerRep<T = any> {
    data: WorkerMessage<T>
  }

export {WorkerMessage}