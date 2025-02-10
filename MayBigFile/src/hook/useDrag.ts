import { useState, useEffect } from "react";

const useDrag = (uploadContainerRef: React.RefObject<HTMLElement>) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    //as的使用场景
    const uploadContainer = uploadContainerRef.current as HTMLElement;
    uploadContainer.addEventListener("dragenter", handleDrag);
    uploadContainer.addEventListener('dragover', handleDrag);//必须得写
    uploadContainer.addEventListener("drop", handleDrop);
    return () => {
      uploadContainer.removeEventListener("dragenter", handleDrag);
      uploadContainer.removeEventListener("drop", handleDrop);
    };
  });
  //用于生成预览url
  useEffect(()=>{
   if(!selectedFile){
    return
   }
   const filePreviewUrl=URL.createObjectURL(selectedFile);
   setFilePreview(filePreviewUrl);
   return ()=>{
      URL.revokeObjectURL(filePreviewUrl);
    };
  }, [selectedFile]);

  //todo 点击事件的实现

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    
    const { files } = e.dataTransfer;
   
    checkFile(files);
  };
  const checkFile = (files: FileList) => {
    if (files.length === 0) {
      return;
    }
     //debugger
    const file = files[0];
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      setSelectedFile(file);
    }
  };

  return {selectedFile,filePreview}
};

export { useDrag };
