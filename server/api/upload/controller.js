var fs = require('fs');
var csv = require('csvtojson');
var Parser = require('../../serial/dynamicParser.js');
module.exports = function index(req,res){
    let file = req.file;
    let parser = new Parser();
    var array = [];
    parser.on('data',function(data){
        let ret = JSON.parse(data);
        delete ret.raw;
        array.push(ret);
    });
    let stream = fs.createReadStream(file.path);
    let headerSet = false;
    csv({workerNum:4})
    .fromStream(stream)
    .on('csv', (csvRow)=>{
        csvRow = csvRow.slice(0,10);
        if(!headerSet){
            res.status(200);
            headerSet = true;
        }
        csvRow[0] = parseInt(csvRow[0], 16);
        let radix = 16;
        csvRow[1] = parseInt(csvRow[1]);
        for(let i = 2; i < csvRow.length; i++) {
            let val = parseInt(csvRow[i], radix);
            csvRow[i] = val;
        }
        parser.write(JSON.stringify(csvRow));
        // csvRow is an array
    })
    .on('done',(error)=>{
        if(error) console.error(error);
        console.log("done reading csv");
        console.log(`Processed ${array.length} from csv`);
        res.send(array);
    })
}