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
    const workerParams = params.map((param, index) => {
      return {
        data: param,
        index,
      };
    });
    return new Promise((rs) => {
      this.currentRunningCount.subscribe((count) => {
        if (count < this.maxWorkerCount && this.pool.length !== 0) {
          let currTaskCount = this.maxWorkerCount - count;
          if (currTaskCount > params.length) {
            currTaskCount = params.length;
          }
          const canUseWorker: WorkerWrapper[] = [];
          for (const worker of this.pool) {
            if ((worker.status = StatusEnum.WAITING)) {
              canUseWorker.push(worker);
              if (canUseWorker.length === currTaskCount) {
                break;
              }
            }
          }
        }
      });
    });
  }
}
