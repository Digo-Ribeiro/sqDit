'use strict'

// (StandartFunctions) START

const getID = (_id) => { return document.getElementById(_id) };
const removeContent = (_id) => { getID(_id).innerHTML = '' };

// END

// (CodeMirror) START

let codemirror = CodeMirror(getID('content'), {
    mode:  "sql",
    lineNumbers: true,
    theme: "darcula"
});

// END

// (GlobalScopeVariables) START

const socket = io();

// END

// (DataExplorer) START

// DATABASES -> blogApp -> navbar

socket.emit('show_db');

const navbar_info_index = (_str, _func) => {
    let elem_code = `<li class="breadcrumb-item active" onclick="${_func}" id="navbar_${_str}"> ${_str} </li>`;
    getID('explorer-navbar').insertAdjacentHTML('beforeend', elem_code);
};

// END

const add_home = () =>{
    navbar_info_index('Databases', `show_db()`);
};

const show_db = () =>{
    removeContent('explorer-navbar');
    socket.emit('show_db');
    add_home();
};

const show_tables = (database_name) =>{
    removeContent('explorer-navbar');
    add_home();
    navbar_info_index(database_name, `show_tables('${database_name}')`);
    getID('editing_now').innerText = `SQL > ${database_name}`;
    socket.emit('db_select', database_name);
};

const show_table_content = (tb_name) =>{
    navbar_info_index(tb_name, ``);
    add_explorer();
    table_select(tb_name);
};

socket.on('show_databases', (_data)=>{

    add_explorer();

    _data.forEach(item => {
        add_data_explorer_items(item, `show_tables('${item}')`, 'db');
    });

});

const add_data_explorer_items = (name, func, _img) =>{

    let _string = `<li id="${name}" class="explorer" onclick="${func}" style="margin-bottom: 5px;"> <span class="db-view ${_img}"></span> ${name} </li>`;
    getID('data_explorer').insertAdjacentHTML('afterbegin', _string);

};

const add_explorer = () =>{

    if(getID('data_explorer')!=null){getID('data_explorer').remove();}
    let _string = `<ul style="list-style-type: none; margin-left: -24px;    height: 10pc;
    overflow: auto;" id="data_explorer"></ul>`;
    getID('explorer_container').insertAdjacentHTML('afterbegin', _string);

};

socket.on('db_tables', (_data)=>{

    add_explorer();

    let _tables = _data.db_tables;
    let db = _data.db

    for(let item of _tables){
        let _str = `Tables_in_${db}`
        add_data_explorer_items(item[_str], `show_table_content('${item[_str]}')`, 'table_');
    }
    
});

const table_select = (table_name) =>{
    add_explorer();
    add_data_explorer_items('Index', `describe_table('${table_name}')`, 'describe_table');
    add_data_explorer_items('Content', `show_content('${table_name}')`, 'show_table');
};

// (Sql Code Editor) START

const console_log = (_log) =>{
    let elem = document.createElement('p');
    elem.className = 'card-text';
    elem.innerText = `root$ ${_log}`;
    getID('console').appendChild(elem);
};

const execute = () =>{
    socket.emit('db_query', codemirror.getValue());
};

socket.on('db_error', (err)=>{
    console_log(err);
});

socket.on('db_data', (_data)=>{
    console_log('Query OK');
});

// END

/*

const explorer_back = () =>{
    socket.emit('show_db');
}

socket.on('table_data', (_data)=>{

    let Rows = {
        Default: [],
        Extra: [],
        Field: [],
        Key: [],
        Null: [],
        Type: []
    }

    let rows_data = _data._tb;

    rows_data.forEach(item=>{
        Rows['Field'].push(item.Field);
        Rows['Extra'].push(item.Extra);
        Rows['Default'].push(item.Default);
        Rows['Key'].push(item.Key);
        Rows['Null'].push(item.Null);
        Rows['Type'].push(item.Type);
    });

    add_table_view(_data.tb_name);
    add_table_rows();

    for(let i = 0; i < Rows.Field.length; i++){
        add_row(i, Rows.Field[i], Rows.Type[i], Rows.Null[i], Rows.Key[i], Rows.Default[i], Rows.Extra[i]);
    }

    

    

});

const add_row = (_indx, _field, _type, _null, _key, _default, _extra) =>{
    let _string = `<tr>
    <th scope="row"> ${_indx} </th>
    <td> ${_field} </td>
    <td> ${_type} </td>
    <td> ${_null} </td>
    <td> ${_key} </td>
    <td> ${_default} </td>
    <td> ${_extra} </td>
    </tr>`;

    getID('table_rows').insertAdjacentHTML('afterbegin', _string);
}

const add_table_rows = () =>{

    let _string = `<table class="table table-dark">
    <thead>
        <tr>
        <th scope="col">#</th>
        <th scope="col">Field</th>
        <th scope="col">Type</th>
        <th scope="col">Null</th>
        <th scope="col">Key</th>
        <th scope="col">Default</th>
        <th scope="col">Extra</th>
        </tr>
    </thead>
    <tbody id="table_rows">
    
    

    </tbody>
    </table>`;

    getID('_data').insertAdjacentHTML('afterbegin', _string);

};

const add_table_view = (tb_name) =>{
    let _str = `<div class="card text-white bg-dark">
    <h5 class="card-header"> Index of ${tb_name} </h5>
    <div class="card-body" id="_data">



    </div>
  </div>`;

  getID('table_view').insertAdjacentHTML('afterbegin', _str);
}


const describe_table = (_id) =>{
    socket.emit('show_table_content', _id);
}

//Data-Explorer


let nav_now = null;

const navbar_info_index = (_str : string) => {
    let elem_code = `<li class="breadcrumb-item active" onclick="${_func}" id="navbar_${_str}"> ${_str} </li>`;
    getID('explorer-navbar').insertAdjacentHTML('beforeend', elem_code);
};

const change_nav = (_name, _type) => {

    if(_type=='db'){
        nav_now = null;
        getID('explorer-navbar').remove();
    }
    
    if(_type=='table'){
        nav_now = _type;
        db_select(_name)
        navbar_info_index(_name, "socket.emit('show_db');");
    }

};


//hierarchy db/tables

const navbar_info_index = (_str ) => {
    if(getID(`navbar_${_str}`)!=null){ getID(`navbar_${_str}`).remove(); }
    let elem_code = `<li class="breadcrumb-item active" onclick="change_dir('${_str}')" id="navbar_${_str}"> ${_str} </li>`;
    getID('explorer-navbar').insertAdjacentHTML('beforeend', elem_code);
};

const databases_ = [];
let tables_ = [];

const change_dir = (_actual) =>{
    
    databases_.forEach(item=>{
        if(item==_actual){
            db_select(_actual);
            navbar_info_index(_actual);
            return false;
        }
    });

    tables_.forEach(item=>{
        if(item==_actual){
            navbar_info_index(_actual);
            table_select(_actual);
            return false;
        }
    });

}; 






*/