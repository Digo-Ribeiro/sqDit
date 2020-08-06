'use strict'

const express = require('express');
const app = new express;
const port = 8080;
const http = require('http').createServer(app)
const io = require('socket.io')(http);
const ejs = require('ejs');

const {sql, refresh_con} = require('./sql-conn.js');

const fs = require('fs');
const fileName = './data-config.json';
const file = require(fileName);

async function start_server(){

    app.use(`/public`, express.static(`${__dirname}/public`));
    app.engine('html', ejs.renderFile);
    app.set('view engine', 'html');
    app.use(express.urlencoded());

    main_routes();

    http.listen(port, ()=>{ console.log(`\x1b[32m [OK] \x1b[0m Server started at port: ${port}`) });

};

async function main_routes(){

    app.get('/', (req,res)=>{
        res.render(`${__dirname}/public/index.html`);
    });

    io.on('connection', async (socket) => {
        
        async function show_db(){
            let get_databases = await sql('SHOW DATABASES');
            let databases = [];
            get_databases._data.forEach(item=>{ databases.push(item.Database) });

            socket.emit('show_databases', databases);
        }

        socket.on('show_table_content', async (db_name)=>{

            let table_settings = await sql(`DESCRIBE ${db_name}`);

            let table_content = await sql(`SELECT * FROM  ${db_name}`);

            socket.emit('table_data', {_tb: table_settings._data, tb_name: db_name});

        });

        socket.on('show_db', ()=>{ show_db() });

        socket.on('db_select', async (db_name)=>{

            file.database = db_name;

            fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
                if (err) throw err });
            
            refresh_con();

            let get_tables = await sql(`SHOW TABLES`);
            socket.emit('db_tables', {db_tables: get_tables._data, db: file.database});

        });

        socket.on('db_query', async (db_query)=>{
            let db_response = await sql(db_query);

            if(db_response._err!=null){
                socket.emit('db_error', db_response._err.code);
            }else{
                socket.emit('db_data', db_response._data);
            }
            
        });

        

    });

    

};

start_server();

// Console "BLINK = \x1b[5m "