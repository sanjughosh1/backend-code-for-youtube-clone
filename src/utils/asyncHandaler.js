const asyncHandalar = (requsetHandelar) => {
   return (req,res,next) => {
        Promise.resolve(requsetHandelar(req,res,next)).catch((err)=> next(err))
    }
}


export {asyncHandalar}


// const asyncHandelar = () => () =>{}
// const asyncHandelar = (func) => {() =>{}}
// const asyncHandelar = (func) => () =>{}
// const asyncHandelar = (func) => async() =>{}

//methard 1***********

// const asyncHandelar = (fu) => async(req,res,next) =>{
//     try {
//         await fu(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500)
//         .json({
//             success:false,
//             message:err.message
//         })
//     }
// }