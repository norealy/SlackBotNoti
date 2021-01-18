const axios = require('axios');

const getAll = async (req,res)=>{
    try {
        const accessTokenAzure = req.cookies['accessTokenAzure'];
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${accessTokenAzure}` },
            url: `https://graph.microsoft.com/v1.0/me/calendarGroups`
        };
        const result = await axios(options);
        return res.status(200).send(result.data);
    } catch (error) {
        return res.status(403).send("Error");
    }
}
const getById = async (req,res)=>{
    try {
        const id = req.params.id;
        const accessTokenAzure = req.cookies['accessTokenAzure'];
        const options = {
            method: 'GET',
            headers: {'Authorization': `Bearer ${accessTokenAzure}` },
            url: `https://graph.microsoft.com/v1.0/me/calendarGroups/${id}`
        };
        const result = await axios(options);
        return res.status(200).send(result.data);
    } catch (error) {
        return res.status(403).send("Error");
    }
}
const addGroups = async (req, res) => {
    try {
        const data = req.body;
        const accessTokenAzure = req.cookies['accessTokenAzure'];
        const options = {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${accessTokenAzure}` },
            data: JSON.stringify(data),
            url: "https://graph.microsoft.com/v1.0/me/calendarGroups",
        };
        const result = await axios(options);
        return res.status(200).send(result.data);
    } catch (error) {
        return res.status(403).send("Error");
    }
}
const editGroups = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const accessTokenAzure = req.cookies['accessTokenAzure'];
        const options = {
            method: 'PATCH',
            headers: { 'content-type': 'application/json', 'Authorization': `Bearer ${accessTokenAzure}` },
            data: JSON.stringify(data),
            url: `https://graph.microsoft.com/v1.0/me/calendarGroups/${id}`,
        };
        const result = await axios(options);
        return res.status(200).send(result.data);
    } catch (error) {
        return res.status(403).send("Error");
    }
}
const deleteGroups = async (req, res) => {
    try {
        const id = req.params.id;
        const accessTokenAzure = req.cookies['accessTokenAzure'];
        const options = {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessTokenAzure}` },
            url: `https://graph.microsoft.com/v1.0/me/calendarGroups/${id}`,
        };
        const result = await axios(options);
        return res.status(200).send("Delete OK");
    } catch (error) {
        console.log(error)
        return res.status(403).send("Error");
    }
}
module.exports = {
    getAll,
    getById,
    addGroups,
    editGroups,
    deleteGroups
}
