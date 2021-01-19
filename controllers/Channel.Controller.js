const axios = require('axios');
const getAll = async (req, res) => {
    try {
        const accessTokenSlack = req.cookies['accessTokenSlack'];
        const options = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessTokenSlack}` },
            url: `https://slack.com/api/conversations.list`
        };
        const result = await axios(options);
        console.log(result.data.channels)
        return res.status(200).send(result.data.channels);
    } catch (error) {
        console.log(error)
        return res.status(403).send("Error");
    }
}
const getInfo = async (req, res) => {
    try {
        const accessTokenSlack = req.cookies['accessTokenSlack'];
        const options = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessTokenSlack}` },
            url: `https://slack.com/api/conversations.info`
        };
        const result = await axios(options);
        console.log(result)
        return res.status(200).send(result);
    } catch (error) {
        console.log(error)
        return res.status(403).send("Error");
    }
}
const addChannel = async (req, res) => {
    try {
        const accessTokenSlack = req.cookies['accessTokenSlack'];
        const data = req.body;
        if(!req.body) return res.status(422).send("Error");
        
        const options = {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${accessTokenSlack}` }, //
            data: data,
            url: "https://slack.com/api/conversations.create",
        };
        const result = await axios(options);
        console.log(result)
        return res.status(200).send(result.data);
    } catch (error) {
        console.error(error);
        return res.status(403).send("Error");
    }
}

module.exports = {
    getAll,
    addChannel,
    getInfo
}
