const express =require('express')
const logger=require('morgan')
const cors=require('cors')
const fs=require('fs-extra')
const path=require('path')
const{StatusCodes}=require('http-status-codes')


//切片的大小
const CHUNK_SIZE=1024*1024*200


//合并后的文件
const PUBLIC_DIR=path.resolve(__dirname,'public');
//临时存放的切片文件
const TEMP_DIR=path.resolve(__dirname,'temp');

fs.ensureDirSync(PUBLIC_DIR);
fs.ensureDirSync(TEMP_DIR);

const app=express();
app.use(logger('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(PUBLIC_DIR))

app.post('/upload/:filename',async (req,res,next)=>{
    //debugger
    const {filename}=req.params;
    const {chunkFileName}=req.query;
    const start=isNaN(req.query.start)?0:parseInt(req.query.start,10)
    const chunkDir=path.resolve(TEMP_DIR,filename)
    const chunkFilePath=path.resolve(chunkDir,chunkFileName)
    await fs.ensureDir(chunkDir);
    const ws=fs.createWriteStream(chunkFilePath,{start,flags:'a'})
    //暂停时的操作
    req.on('aborted',()=>{ws.close()});
    try{
        await pipeStream(req,ws);
        res.json({success:true})
    }catch(error){
        next(error)
    }

})


app.get('/merge/:filename',async(req,res,next)=>{
    const {filename}=req.params;
    try{
        await mergeChunks(filename);
        res.json({success:true})
    }catch(error){
        next(error)
    }
})

//秒传和断点续传
app.get('/verify/:filename',async(req,res,next)=>{
    const{filename}=req.params;
    const filePath=path.resolve(PUBLIC_DIR,filename);
    const isExist=await fs.pathExists(filePath)
    if(isExist){
        return res.json({success:true,needUpload:false})
    }
    const chunkDir=path.resolve(TEMP_DIR,filename)
    const existDir=await fs.pathExists(chunkDir)
    let uploadedChunkList=[]
    if(existDir){
        const chunkFileNames=await fs.readdir(chunkDir)
        uploadedChunkList=await Promise.all(chunkFileNames.map(async(chunkFileName)=>{
            //返回文件的详细信息，比如上传的大小啥的
            const {size}=await fs.stat(path.resolve(chunkDir,chunkFileName));
            return{chunkFileName,size}
        }))
    }
    return res.json({success:true,needUpload:true,uploadedChunkList})

})

app.post('/demo',async(req,res,next)=>{
    //debugger
    console.log('触发demo',req.query);
    debugger
    const start=req.query.start;
    const a=req.body
    console.log(a);
    debugger
    res.json({success:true})
})
function pipeStream(rs,ws){
    return new Promise((resolve,reject)=>{
        rs.pipe(ws).on('finish',resolve).on('error',reject);
    })
}

async function mergeChunks(filename){
    const mergedFilePath=path.resolve(PUBLIC_DIR,filename);
    const chunkDir=path.resolve(TEMP_DIR,filename)
    const chunkFiles=await fs.readdir(chunkDir)
    chunkFiles.sort((a,b)=>Number(a.split('-')[1])-Number(b.split('-')[1]))
    try{
        const pipes=chunkFiles.map((chunkFile,index)=>{
            return pipeStream(
                fs.createReadStream(path.resolve(chunkDir,chunkFile),{autoClose:true}),
                fs.createWriteStream(mergedFilePath,{start:index*CHUNK_SIZE})
            )
        })
        await Promise.all(pipes)
        //合并完之后将切片删除
        await fs.rmdir(chunkDir,{recursive:true})
    }catch(e){
        next(e)
    }
}

app.listen(8080,()=>{console.log('端口8080监听')})