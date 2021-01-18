require('dotenv').config();
const _ = require('lodash');
/**
 * Nếu có biến môi trường thì trả về default.
 * @param {*} env 
 * @param {*} _default
 * @returns  
 */
function get(env,_default){
    const varEnv = _.get(process.env,env,_default);
    return varEnv;
}
/**
 * 
 * @param {*} env 
 */
function getOrFail(env){
    const varEnv = _.get(process.env,env);
    if(varEnv) return varEnv;
    throw new Error('Valid not found');
}
module.exports = {
    get,
    getOrFail
}