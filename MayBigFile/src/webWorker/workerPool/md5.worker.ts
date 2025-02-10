import SparkMD5 from 'spark-md5'
import { workerLabel } from '../../type/worker-labels';
import { WorkerMessage } from '../workerMessage/index';
self.addEventListener('message',(d)=>{
    //debugger
    const {data}=d
    const hash = SparkMD5.ArrayBuffer.hash(data);
    postMessage(
        new WorkerMessage(workerLabel.DONE,{
            result:hash,
            chunk:data
        }),
        [data]//用于 transfer 的数据, 以避免结构化克隆,性能优化
    )
})
self.onerror = (error) => {
    console.error('Worker error:', error);
};