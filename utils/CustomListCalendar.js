
module.exports.arrayCal = (arr) => {
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
            console.log(item)
            viewArr.push(viewItem);
        });
        console.log(viewArr);
        return viewArr;
    } catch (error) {
        return error;
    }
}
