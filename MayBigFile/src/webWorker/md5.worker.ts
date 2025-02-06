import SparkMD5 from 'spark-md5'
import { WorkerMessage } from './workerMessage';
import { workerLabel } from '../type/worker-labels';

self.addEventListener('message',(data)=>{
    const hash = SparkMD5.ArrayBuffer.hash(data);
    postMessage(
        new WorkerMessage(workerLabel.DONE,{
            result:hash,
            chunk:data
        }),
        [data]//用于 transfer 的数据, 以避免结构化克隆,性能优化
    )
})