import { BehaviorSubject } from "rxjs";
import { StatusEnum, WorkerWrapper } from "./workerWrapper";

abstract class WorkerPool {
  pool: WorkerWrapper[] = [];
  maxWorkerCount: number;
  currentRunningCount = new BehaviorSubject(0);
  results = [];

  protected constructor(max = 4) {
    this.maxWorkerCount = max;
  }

  exec(params: ArrayBuffer[]) {
    //debugger
    const workerParams = params.map((param, index) => {
      return {
        data: param,
        index,
      };
    });
    return new Promise((rs) => {
    //debugger
      this.currentRunningCount.subscribe((count) => {
        //debugger
        if (count < this.maxWorkerCount && workerParams.length !== 0) {
          let currTaskCount = this.maxWorkerCount - count;
          if (currTaskCount > params.length) {
            currTaskCount = params.length;
          }
          const canUseWorker: WorkerWrapper[] = [];
          //debugger
          for (const worker of this.pool) {
            if ((worker.status === StatusEnum.WAITING)) {
              canUseWorker.push(worker);
              if (canUseWorker.length === currTaskCount) {
                break;
              }
            }
          }
          // if(canUseWorker.length===0){
          //   return
          // }
          const paramsToRun = workerParams.splice(0, currTaskCount)
          this.currentRunningCount.next(this.currentRunningCount.value+currTaskCount)
          canUseWorker.forEach((worker,index)=>{
            const param=paramsToRun[index];
            worker.run(param.data,params,param.index).then((res)=>{
              const {content,index1}=res;
              console.log(content,index1);
              
              this.results[index1]=content;
            }).catch((err)=>{
              this.results[index1]=err;
            }).finally(()=>{
              this.currentRunningCount.next(this.currentRunningCount.value-1);
            })  
          })
        }
        if(this.currentRunningCount.value==0&&workerParams.length===0){
          
          rs(this.results);
        }
      });
    });
  }
}

export { WorkerPool };
