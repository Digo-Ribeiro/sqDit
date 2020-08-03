'use strict'

const mysql = require('mysql');

const fileName = './data-config.json';
const file = require(fileName);
let get_data = null;

const _refresh_sql_connection = () =>{

    get_data = mysql.createConnection({
        host: file.host,
        user: file.username,
        password: file.password,
        database: file.database
    });

}


_refresh_sql_connection();

const _resolve_query = (_str) =>{
    return new Promise( (resolve, reject)=>{
        get_data.query(_str, (err, rows)=>{
            if(err) { reject(err) };
            resolve(rows);
        });
    });
};

async function sql(_str){
    let _data = []
    let _err = null; // string
    await _resolve_query(_str).then((rows)=>{ _data = rows }).catch((err)=>{ _err = err; });
    return({ _data, _err });
}

module.exports = { sql: sql, refresh_con: _refresh_sql_connection };

/*
write json

fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
  if (err) return console.log(err);
  console.log(JSON.stringify(file));
  console.log('writing to ' + fileName);
});

*/