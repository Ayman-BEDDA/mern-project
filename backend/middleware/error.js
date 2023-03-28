const errorHandler = async (err, req, res, next) => {
    res
        .status(err.statusCode || 500)
        .json({
            success: false,
            error : err.message || "C'est chaud mgl"
        })
}

module.exports = errorHandler