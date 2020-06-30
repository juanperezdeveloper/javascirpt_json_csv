const csv = require('csv-parser');
const fs = require('fs');

// Input:
const Folder = "D:/Project/test/outFolder/";
const files = fs.readdirSync(Folder);

// header of combined csv file
const header = []; 

function transpose(a) {
    // Calculate the width and height of the Array
    var w = a.length || 0;
    var h = a[0] instanceof Array ? a[0].length : 0;
  
    // In case it is a zero matrix, no transpose routine needed.
    if(h === 0 || w === 0) { return []; }
    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} t Transposed data is stored in this array.
     */
    var i, j, t = [];
  
    // Loop through every item in the outer array (height)
    for(i=0; i<h; i++) {
      // Insert a new row (array)
      t[i] = [];
  
      // Loop through every item per item in outer array (width)
      for(j=0; j<w; j++) {
        // Save transposed data.
        t[i][j] = a[j][i];
      }
    }
  
    return t;
}

files.forEach(combineFunc); 

// combine all csv files in "Folder"
function combineFunc(file) {
    csvFile = Folder + file;
    fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (row) => {
            var values = [];
            var csvStr = "";
            if (header.length == 0) {
                Object.keys(row).forEach(function(key) {
                    header.push(key);
                    values.push([key, row[key]]);
                });
            } else {
                Object.keys(row).forEach(function(key) {
                    values.push([row[key]]);
                });
            }
            var transposedMessage = transpose(values);
            for(var i = 0; i < transposedMessage.length; i++) {
                csvStr += transposedMessage[i].join(",")+"\n";
            }             
            fs.appendFile('out.csv', csvStr, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        })
        .on('end', () => {
            console.log('CSV files successfully combined');
        });
}

