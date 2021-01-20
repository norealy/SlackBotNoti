const getNotis = (req, res) => {
    try {
        const challenge = req.body.challenge;
        if (challenge) {
            return res.status(200).send(challenge);
        }
        console.log(req.body.event) 
        return res.status(202).send("Ok");
    } catch (error) {
        return res.status(403).send("Error");
    }
}

module.exports = {
    getNotis
}
