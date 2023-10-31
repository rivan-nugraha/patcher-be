const express = require('express');
const multer = require('multer');
const { PythonShell } = require('python-shell');
const cors = require('cors');
const ip = require('ip');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server, {
    cors: {
      origin: '*',
    }
});
const port = 6102;
const { deletingFile } = require('./helper/helper');

app.use(bodyParser());
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, csb) => {
        csb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
    if(!req.file){
        return res.status(400).send('No File Uploaded')
    }

    const scriptPath = req.file.path;

    const options = {
        pythonOptions: ['-u'],
    }

    const pyShell = new PythonShell(scriptPath, options);

    pyShell.on('message', (message) => {
        io.emit('pythonOutput', message)
    })

    pyShell.end((err, code, signal) => {
        if (err) {
            res.status(500).send(err.toString());
            io.in('pythonOutput').disconnectSockets(true)
            deletingFile(scriptPath);
        } else {
            res.send('Script executed.');
            io.in('pythonOutput').disconnectSockets(true)
            deletingFile(scriptPath);
        }
    });
});

server.listen(port, () => {
    console.log(`Server Running On ${ip.address()}:${port}`);
})