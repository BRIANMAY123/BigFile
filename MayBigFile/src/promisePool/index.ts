import { BehaviorSubject } from "rxjs";
type AsyncFunction=()=>Promise<any>;

class PromisePool {
  private pool: {fn:()=>Promise<any>,index:number}[] = [];
  private maxCount=4;
  private results:any=[]
  currentRunningCount=new BehaviorSubject<number>(0);

  //
  constructor(functions:AsyncFunction[]){
    functions.forEach((fn,index:number)=>{
        this.pool.push({fn,index});
    })
  }
  execute(){
    return new Promise((resolve,reject)=>{
        this.currentRunningCount.subscribe((count)=>{
            if(count<this.maxCount&&this.pool.length>0){
                let currTask=this.maxCount-count;
                if(currTask>this.pool.length){
                    currTask=this.pool.length;
                }
                const tasks=this.pool.splice(0,currTask);
                this.currentRunningCount.next(this.currentRunningCount.value+currTask);
                tasks.forEach((task)=>{
                    const {fn,index}=task;
                    fn().then((res)=>{
                        this.results[index]=res;
                        //console.log(111);
                        
                    }).catch(err=>{
                        this.results[index]=err;
                    }).finally(()=>{
                        this.currentRunningCount.next(count-1);
                    });
                })

            }
            if(count===0&&this.pool.length===0){
                resolve(this.results);
            }
        })
    })
  }
}

export {PromisePool}





