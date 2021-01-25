const axios = require('axios');

const getHistory = async (req, res) => {
    try {
        const accessTokenSlack = req.cookies['accessTokenSlack'];
        const id = req.params.id;
        const options = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessTokenSlack}` },
            url: `https://slack.com/api/conversations.history?channel=${id}`
        };
        const result = await axios(options);
        // console.log(result.data)
        return res.status(200).send(result.data);
    } catch (error) {
        console.log(error)
        return res.status(403).send("Error");
    }
}
const createMessage = async (req, res) => {
    try {
        const accessTokenSlack = req.cookies['accessTokenSlack'];
        const data = req.body;
        if(!req.body) return res.status(422).send("Error");
        
        const options = {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${accessTokenSlack}` },
            data: data,
            url: "https://slack.com/api/chat.postMessage",
        };
        const result = await axios(options);
        // console.log(result.data.message)
        return res.status(200).send(result.data);
    } catch (error) {
        console.error(error);
        return res.status(403).send("Error");
    }
}
const addCalendarsToChannel = async (req, res) => {
    try {
        const accessTokenSlack = req.cookies['accessTokenSlack'];
        const data = req.body;
        if(!req.body) return res.status(422).send("Error");
        
        const options = {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${accessTokenSlack}` },
            data: data,
            url: "https://slack.com/api/chat.postMessage",
        };
        const result = await axios(options);
        // console.log(result.data.message)
        return res.status(200).send(result.data);
    } catch (error) {
        console.error(error);
        return res.status(403).send("Error");
    }
}
const updateMessage = async (req, res) => {
    try {
        const accessTokenSlack = req.cookies['accessTokenSlack'];
        const data = req.body;
        if(!req.body) return res.status(422).send("Error");
        const options = {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessTokenSlack}` },
            data: data,
            url: `https://slack.com/api/chat.update`
        };
        const result = await axios(options);
        // console.log(result.data)
        return res.status(200).send(result.data);
    } catch (error) {
        // console.log(error)
        return res.status(403).send("Error");
    }
}
const deleteMessage = async (req, res) => {
    try {
        const accessTokenSlack = req.cookies['accessTokenSlack'];
        const data = req.body;
        data.ts = Math.floor(new Date().getTime()/1000.0) +  1000
        if(!req.body) return res.status(422).send("Error");
        const options = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessTokenSlack}` },
            data:data,
            url: `https://slack.com/api/chat.delete`
        };
        const result = await axios(options);
        // console.log(result.data)
        return res.status(200).send(result.data);
    } catch (error) {
        // console.log(error)
        return res.status(403).send("Error");
    }
}
module.exports = {
    getHistory,
    createMessage,
    updateMessage,
    deleteMessage,
    addCalendarsToChannel
}
