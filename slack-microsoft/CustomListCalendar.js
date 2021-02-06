
module.exports.customArrCal = (arr) => {
    try {
        const viewArr = [];
        arr.forEach(item => {
            const viewItem = {
                "text": {
                    "type": "plain_text",
                    "text": item.name,
                    "emoji": true
                },
                "value": item.id
            }
            viewArr.push(viewItem);
        });
        return viewArr;
    } catch (error) {
        return error;
    }
}
