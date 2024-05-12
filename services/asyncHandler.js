export function asyncHandler(fn){

    return (req,res,next) => {
        fn(req,res,next).catch(err => {
            return next({err:err.stack})
        })
    }
}

export function gloablaErrorHandler(err,req,res,next){
    return res.status(err.cause || 500).json({message: "catch error", err: err.err})
}