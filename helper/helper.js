const fs = require('fs');

const deletingFile = (filepath) => {
    fs.unlink(filepath, (err) => {
        if(err){
            console.log("Error Ketika Hapus Script");
        }
    })
}

module.exports = {
    deletingFile,
}