exports.common = function (req, res, next) {
    // const path = req.path.split("/");
    // if (path[1] == 'auth' || path[1] == 'outlook' || path[1] == 'code') {
    //     next();
    // } else {
    //     const accessToken = req.cookies['accessTokenAzure'];
    //     if (!accessToken) return res.status(401).send({
    //         "code": "E_VALIDATION",
    //         "message": "InvalidAuthenticationToken",
    //         "description": "CompactToken validation failed"
    //     });
        
    // }
    next();
}