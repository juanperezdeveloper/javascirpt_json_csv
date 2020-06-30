const fs = require('fs');

function convert(recordData) {
    var json = recordData;
    var csv = [];

    // Part part 
    var proc = json.part;
    var keys = ['partTypeID', 'partID'];
    for(var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = proc[key];
        var csvline = [key, value];
        csv.push(csvline); 
    }

    // Measurements part 
    for(var m = 0; m < json.measurements.length; m++) {
        var meas = json.measurements[m];
        var keys = [];
        for(var key in meas.series) {
            keys.push(key);
        }     

        // first key i=0 is time
        for(var i = 1; i < keys.length; i++) {
            var key = keys[i];
            if ((keys[i] != 'Name') && (keys[i] != 'Temperature') && (keys[i] != 'Set Temperature Name') && (keys[i] != 'Set Temperature Values')){
                var value = meas.series[keys[i]];
                var csvline = [key, value];
                csv.push(csvline);
            }
            if (keys[i] == 'Name') {
                for(var j = 0; j < meas.series['Name'].length; j++) {
                    for(var k = 0; k < meas.series['Temperature'].length; k++) {
                        var temp = meas.series['Temperature'][k];
                        for(var l = 0; l < temp.length; l++) {
                            var csvline = [meas.series['Name'][j], temp[l]];
                            csv.push(csvline); 
                            j++;
                        }
                    }
                }      
            }  
            if (keys[i] == 'Set Temperature Name') {
                for(var j = 0; j < meas.series['Set Temperature Name'].length; j++) {
                    for(var k = 0; k < meas.series['Set Temperature Values'].length; k++) {
                        var temp = meas.series['Set Temperature Values'][k];
                        for(var l = 0; l < temp.length; l++) {
                            var csvline = [meas.series['Set Temperature Name'][j], temp[l]];
                            csv.push(csvline); 
                            j++;
                        }
                    }
                }      
            }       
        }
    }

    var csvf = "";
    var transposedMessage = transpose(csv); 
    for(var i = 0; i < transposedMessage.length; i++) {
        csvf += transposedMessage[i].join(",")+"\n";
    }
    return (csvf);
}

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

// Main funtion starts here
// Adapt you input and output folders
// Input:
const Folder = "D:/Project/test/testFolder";
// Output:
const outFolder = "D:/Project/test/outFolder";
var testFolder = Folder + '/';

fs.readdirSync(testFolder).forEach(file => {
    var fileName = outFolder + "/" + file;
    // If it is a file from CDL
    if(file.indexOf('cdl_delivery') !== -1) {
        console.log("FILE: " + testFolder + file);
        var x = testFolder + file;
        var readData = (Buffer.from(fs.readFileSync(x), 'base64')).toString('ascii');
        var jsonBufferNoLines = readData.replace(/\n/g, ',');
        jsonBufferNoLines = "[" + jsonBufferNoLines + "]";
        var finalPayload = JSON.parse(jsonBufferNoLines);
        var bigfileStr = "";

        for(var i = 0; i < finalPayload.length; i++) {
            // individual files
            bigfileStr = convert(finalPayload[i]);
            fs.writeFile(fileName + '__' + (i + 1) + '.csv', bigfileStr, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
            console.log("File " + i + " saved!");
        }
    }
});

