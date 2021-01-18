const axios = require('axios');

const getAll = async (req, res) => {
    try {
        const accessTokenAzure = req.cookies['accessTokenAzure'];
        const options = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessTokenAzure}` },
            url: `https://graph.microsoft.com/v1.0/me/events`
        };
        const result = await axios(options);
        return res.status(200).send(result.data.value);
    } catch (error) {
        return res.status(403).send("Error");
    }
}
const getById = async (req, res) => {
    try {
        const idEvent = req.params.id;
        const accessTokenAzure = req.cookies['accessTokenAzure'];
        const options = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessTokenAzure}` },
            url: `https://graph.microsoft.com/v1.0/me/events/${idEvent}`
        };
        const result = await axios(options);
        return res.status(200).send(result.data);
    } catch (error) {
        return res.status(403).send("Error");
    }
}
const getEventInCalendar = async (req, res) => {
    try {
        const id = req.params.id;
        const accessTokenAzure = req.cookies['accessTokenAzure'];
        const options = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessTokenAzure}` },
            url: `https://graph.microsoft.com/v1.0/me/calendars/${id}/events`
        };
        const result = await axios(options);
        return res.status(200).send(result.data.value);
    } catch (error) {
        return res.status(403).send("Error");
    }
}
const addEvent = async (req, res) => {
    try {
        console.log("Create event")
        const data = req.body;
        if(!req.body) return res.status(422).send("Error");
        const accessTokenAzure = req.cookies['accessTokenAzure'];
        const options = {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${accessTokenAzure}` },
            data: JSON.stringify(data),
            url: "https://graph.microsoft.com/v1.0/me/events",
        };
        const result = await axios(options);
        return res.status(200).send(result.data);
    } catch (error) {
        return res.status(403).send("Error");
    }
}
const editEvent = async (req, res) => {
    try {
        const eventID = req.params.id;
        const data = req.body;
        const accessTokenAzure = req.cookies['accessTokenAzure'];
        const options = {
            method: 'PATCH',
            headers: { 'content-type': 'application/json', 'Authorization': `Bearer ${accessTokenAzure}` },
            data: JSON.stringify(data),
            url: `https://graph.microsoft.com/v1.0/me/events/${eventID}`,
        };
        const result = await axios(options);
        return res.status(200).send(result.data);
    } catch (error) {
        return res.status(403).send("Error");
    }
}
const deleteEvent = async (req, res) => {
    try {
        const eventID = req.params.id;
        const accessTokenAzure = req.cookies['accessTokenAzure'];
        const options = {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessTokenAzure}` },
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
    getById,
    getEventInCalendar,
    addEvent,
    editEvent,
    deleteEvent
}
