// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
var path = require('path');
require('dotenv').config()
// Set the region 
AWS.config.update({region: 'ap-northeast-1'});

class awsService{
  constructor(bucket_name){
    this.bucket_name = bucket_name
    this.s3 = new AWS.S3()
  }

  uploadAudio = async (filename,content)=>{
    var uploadParams = {Bucket: this.bucket_name, Key: filename, Body: content};
    await new Promise((resolve,reject)=>{
      this.s3.upload(uploadParams, function (err, data) {
        if (err) {
          console.log("Error", err);
        } if (data) {
          console.log(data);
          console.log("Upload Success", data.Location);
          resolve()
        }
      });
    })
    
  }

  getAudio = async (filename)=>{
    try{
      let params = {
        Bucket: this.bucket_name,
        Key: filename
      }
      await new Promise((resolve,reject)=>{
          this.s3.getObject(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else{
             
              resolve({"buffer":data.Body})
              console.log(data.Body)
              return {"buffer":data.Body}
            }
        })
      })
    }catch(err){

    }
    
    
}
}


const service = new awsService('practiceopensource')

module.exports = service
// service.uploadAudio("s","s")
// service.getAudio("s")
