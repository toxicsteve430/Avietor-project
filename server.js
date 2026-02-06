const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Using your confirmed App Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fidelsteven71@gmail.com',
        pass: 'akae wsak puqc bnbi' 
    }
});

let multiplier = 1.00;

function getCrashPoint() {
    const seed = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha512').update(seed).digest('hex');
    const hs = parseInt(hash.substring(0, 13), 16);
    return Math.max(1, (Math.floor(100 / (1 - hs / Math.pow(2, 52))) / 100));
}

function startNewRound() {
    const crashPoint = getCrashPoint();
    transporter.sendMail({
        from: '"Aviator Signal" <fidelsteven71@gmail.com>',
        to: 'fidelsteven71@gmail.com',
        subject: `🔔 SIGNAL: ${crashPoint}x`,
        text: `The next plane crashes at ${crashPoint}x.`
    });

    multiplier = 1.00;
    io.emit('status', "FLYING");
    const flightTimer = setInterval(() => {
        multiplier += 0.05 * Math.sqrt(multiplier);
        io.emit('tick', multiplier.toFixed(2));
        if (multiplier >= crashPoint) {
            clearInterval(flightTimer);
            io.emit('crashed', { final: multiplier.toFixed(2) });
            setTimeout(() => {
                io.emit('status', "WAITING");
                setTimeout(startNewRound, 5000); 
            }, 3000);
        }
    }, 100); 
}

app.use(express.static('public'));
startNewRound();
server.listen(process.env.PORT || 3000);
