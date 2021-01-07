const express = require('express');
const path = require('path');
const upload = require('express-fileupload')
const fs = require('fs');
const nodemailer = require('nodemailer')
const convertapi = require('convertapi')('Yial6A6yFLQvdNa0')

require('dotenv').config()

const app = express();

app.use(upload())
app.use(express.static(path.join(__dirname, 'public')))


let dataForFiles = fs.readFileSync(path.join(__dirname, 'filesConverted', 'filesConverted.txt'), {encoding:'utf8'}); 

function sendMail(mail, pathFile) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'dkarahmetovic5@gmail.com',
          pass: process.env.PASSWORD
        }
    });
    
    let mailOptions = {
        from: 'dkarahmetovic5@gmail.com',
        to: mail,
        subject: 'Converting Word to PDF',
        text: 'Thank you for using our services!',
        attachments: [
            {   
                path: pathFile
            }
        ]
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    }); 
}



function convertWordToPDF(req, filePathWord, filePathPDF, ) {
    
    convertapi.convert('pdf', {
        File: filePathWord
    }, 'docx').then(result => {
        console.log(result)

        result.saveFiles(filePathPDF)

        fs.writeFileSync(path.join(__dirname, 'filesConverted', 'filesConverted.txt'), +dataForFiles + 1)

        app.get('/getFileLink', (req, res) => {
            res.sendFile(filePathPDF)
        })

        if(req.body.email) {
            let email = req.body.email

            sendMail(email, filePathPDF)
        }

    }).catch(err => {
        app.get('/getFileLink', (req, res) => {
            res.status(401)
            res.send({"message": "Something went wrong!"})
        })
        console.log('File write error', err)
    })
    
    
}




app.get('/', (req, res) => {

})

app.get('/api', (req, res) => {

    dataForFiles = fs.readFileSync(path.join(__dirname, 'filesConverted', 'filesConverted.txt'), {encoding:'utf8'});

    res.json({
        documentsConverted: dataForFiles
    })
})

app.post('/upload', (req, res) => {
    // console.log(req.body, req.files)
    if(req.files && req.files.upfile) {
        let file = req.files.upfile;
        let name = file.name;
        let type = file.mimetype;
        let filePathWord = path.join(__dirname, 'uploads', name)

        file.mv(filePathWord, err => {
            if(err) {
                console.log('Error! ', name, err)
                app.get('/getFileLink', (req, res) => {
                    res.status(401)
                    res.send({"message": "Something went wrong!"})
                })
                res.send('Error occured')
            } else {
                let filePathPDF = path.join(__dirname, 'uploads', `${name}.pdf`)
                
                convertWordToPDF(req, filePathWord, filePathPDF)

                res.send('Done')
            }
        })
    } else {
        console.log('No file selected!')
        app.get('/getFileLink', (req, res) => {
            res.status(401)
            res.json({"message": "No file selected!"})
        })
        res.send()
    }
})


app.listen(process.env.PORT, () => console.log('Server is up on port 3000'))