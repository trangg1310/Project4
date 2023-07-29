import pool from "../configs/connectDB"
import multer from "multer"
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
var appRoot = require('app-root-path');

let getHomepage = (req, res) => {
    //logic
    return  res.render('index.ejs')
}
var errors = [];
var result = 0;
var user = {
    id: '',
    name: '', 
    cmnd: '',
    face: ''
}
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

const upload = multer().single('face');

let postMatch = async (req, res) => {
    errors = [];
    result = 0;
    const cmnd = req.body.cmnd;
    const userImageFilePath = req.file.path;

    let [user, field] = await pool.execute(`select * from user where user.cmnd = ?`, [cmnd]);
    console.log(user[0]);
   
    if (user[0]!==undefined) {
        user.name = user[0].name;
        let urlfaceuser = appRoot + "/src/public" + user[0].face ; 

        const formData = new FormData();
            
        // Convert user image file to Blob-like object and append it to formData
        const userImageBuffer = fs.readFileSync(userImageFilePath);
        formData.append('image1', userImageBuffer, {
            filename: 'user_image.jpg',
            contentType: 'image/jpeg'
        });

        // Convert face image file from the server to Blob-like object and append it to formData
        const faceImageBuffer = fs.readFileSync(urlfaceuser);
        formData.append('image2', faceImageBuffer, {
            filename: 'face_image.jpg',
            contentType: 'image/jpeg'
        });


            // console.log(userImageFilePath);
            // console.log(urlfaceuser);
            // console.log(formData);
            fetch('http://127.0.0.1:8800/compare_faces', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                //console.log(response);
                return response.json()
            })
            .then(data => {
                if (data.error) {
                    console.log(data.error);
                    errors.push(data.error);
                    return res.redirect('/result');
                } else {
                    const similarityPercentage = data.similarity_percentage.toFixed(2);
                    console.log(similarityPercentage);
                    result = similarityPercentage;
                    res.redirect('/result');
                    // if(similarityPercentage >= 50) {
                    //     res.send(`Bạn đúng là: ${user[0].name}`);
                    // } else {
                    //     res.send(`Bạn không phải là: ${user[0].name}`)
                    // }
                }
            })    
            .catch(error => {
                console.log('An error occurred while comparing faces.');
                console.log(error);
            });
    } else {
        errors.push('Cmnd không tồn tại!');
        res.redirect('/result');
    }
    
}

let getResult =  (req, res) => {
    return res.render('result.ejs', {error: errors, result:result, name: user.name}); 
}

module.exports = {
    getHomepage,
    postMatch,
    getResult
}