const sqlite3 = require("sqlite3").verbose();
const fs = require('fs');
const csv = require('csv-parser')

const dbFilePath = "./synth_data.db"
const jsonFilePath = './particle_movement_dataset.json';   // Replace with your CSV file path

const db = new sqlite3.Database(dbFilePath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
});

//Cleans value to make it safe for variable table naming without sql injection
function scrubInput(input) {
    if (!input) {
        return '';
    }
    return input.replace(/[^a-zA-Z0-9_]/g, '');
}

//createTable("synthetic_data")
//ID,Type of Particle,Time of Measurement,"Particle [X,Y,Z] Position","Particle [X,Y,Z] Velocity","Particle [X,Y,Z] Acceleration",Humidity (%),Temperature (Â°C),Air Pressure (Pa)

//Create table
function createTable(name) {
    let sql = `CREATE TABLE ${scrubInput(name)}(
        id INTEGER PRIMARY KEY,
        type_of_particle,
        time_of_measurement,
        position,
        velocity,
        acceleration,
        humidity,
        temperature,
        air_pressure)`
    db.run(sql)
}

//insertIntoTable("synthetic_data", ["Smoke", 1742818360, "[14.676023441499328, 51.3084652955312, 37.16005498168943]", "[0.684715816223723, 0.3711278557244828, -1.728328115498459]", "[0.2504003532524618, 0.2257891104710611, 0.16636769749458735]", 51.636539942047555, 6.34678348837496, 104590.45435298939])

function insertIntoTable(name, values) {
    sql = `INSERT INTO ${scrubInput(name)}(
        type_of_particle,
        time_of_measurement,
        position,
        velocity,
        acceleration,
        humidity,
        temperature,
        air_pressure
    ) VALUES (?,?,?,?,?,?,?,?)`
    db.run(sql, values, (err) => {
        if (err) return console.error(err.message);
        console.log("Inserting...")
    })
}

//JSON_into_DB("synthetic_data")

function JSON_into_DB(name) {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            db.close();
            return;
        }

        try {
            const jsonData = JSON.parse(data);

            jsonData.forEach(row => {
                const valuesToInsert = row.slice(1); // Skip the ID

                // Convert the array values for position, velocity, and acceleration to JSON strings
                valuesToInsert[2] = JSON.stringify(valuesToInsert[2]); // position
                valuesToInsert[3] = JSON.stringify(valuesToInsert[3]); // velocity
                valuesToInsert[4] = JSON.stringify(valuesToInsert[4]); // acceleration

                insertIntoTable(name, valuesToInsert);
            });

            console.log('Finished inserting data from JSON (arrays converted to strings).');

        } catch (error) {
            console.error('Error parsing JSON:', error);
        } finally {
            db.close((err) => {
                if (err) {
                    console.error('Error closing the database:', err.message);
                } else {
                    console.log('Database connection closed.');
                }
            });
        }
    });
}

//Drop table
//db.run(`DROP TABLE synthetic_data`)

//Insert
// sql = `INSERT INTO users(first_name,last_name,username,password,email) VALUES (?,?,?,?,?)`
// db.run(sql,["bart","entrene","mike_user","test","emailentry"],(err) => {
//     if (err) return console.error(err.message);
// })

//update
// sql = `UPDATE users SET first_name = ? WHERE id = ?`;
// db.run(sql,["jake",1], (err) => {
//     if (err) return console.error(err.message);
// })

//delete
// sql = `DELETE FROM users WHERE id = ?`;
// db.run(sql,[1], (err) => {
//     if (err) return console.error(err.message);
// })

//query
function queryTable(name) {
    sql = `SELECT * FROM ${scrubInput(name)}`;
    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);
        rows.forEach(row => {
            console.log(row)
        })
    })
}

//queryTable("synthetic_data")