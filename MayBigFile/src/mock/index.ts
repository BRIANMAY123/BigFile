const createAsyncFunction = (id: number, delay: number) => {
    return () => new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Task ${id} completed after ${delay} ms`);
            resolve(`Result of task ${id}`);
        }, delay);
    });
};

// 创建一组异步函数
const asyncFunctions = [
    createAsyncFunction(1, 1000), // 1秒后完成
    createAsyncFunction(2, 1000), // 2秒后完成
    createAsyncFunction(3, 1000), // 1.5秒后完成
    createAsyncFunction(4, 1000),  // 0.5秒后完成
    createAsyncFunction(5, 1000), // 3秒后完成
    createAsyncFunction(6, 1000), // 1秒后完成
    createAsyncFunction(7, 1000),
    createAsyncFunction(8, 1000),
];

export {asyncFunctions}