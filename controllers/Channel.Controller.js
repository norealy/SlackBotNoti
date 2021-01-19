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

const addChannel = async (req, res) => {
    try {
        const data = req.body;
        if(!req.body) return res.status(422).send("Error");
        const accessTokenSlack = req.cookies['accessTokenSlack'];
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
        return res.status(403).send("Error");
    }
}
const updateChannel = async (req, res) => {
    try {
        const eventID = req.params.id;
        const data = req.body;
        const accessTokenSlack = req.cookies['accessTokenSlack'];
        const options = {
            method: 'PATCH',
            headers: { 'content-type': 'application/json', 'Authorization': `Bearer ${accessTokenSlack}` },
            data: JSON.stringify(data),
            url: `https://graph.microsoft.com/v1.0/me/events/${eventID}`,
        };
        const result = await axios(options);
        return res.status(200).send(result.data);
    } catch (error) {
        return res.status(403).send("Error");
    }
}
const deleteChannel = async (req, res) => {
    try {
        const eventID = req.params.id;
        const accessTokenSlack = req.cookies['accessTokenSlack'];
        const options = {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessTokenSlack}` },
            url: `https://graph.microsoft.com/v1.0/me/events/${eventID}`,
        };
        const result = await axios(options);
        return res.status(200).send("Delete OK");
    } catch (error) {
        return res.status(403).send("Error");
    }
}
module.exports = {
    getAll,
    addChannel,
    updateChannel,
    deleteChannel
}
