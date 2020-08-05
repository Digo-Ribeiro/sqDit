'use strict'

const getID = (_id) => { return document.getElementById(_id) };

let socket = io();

let codemirror = CodeMirror(getID('content'), {
    mode:  "sql",
    lineNumbers: true,
    theme: "darcula"
  });

const db_select = (_id) =>{
    socket.emit('db_select', _id);
};

const execute = () =>{
    socket.emit('db_query', codemirror.getValue());
};

socket.on('db_error', (err)=>{

    let elem = document.createElement('p');
    elem.className = 'card-text';
    elem.innerText = `root$ ${err}`;

    getID('console').appendChild(elem);
});

const explorer_back = () =>{
    socket.emit('show_db');
}

socket.on('db_tables', (_data)=>{


    add_explorer();

    let _tables = _data.db_tables;
    let db = _data.db

    for(let item of _tables){
        let _str = `Tables_in_${db}`
        add_data_explorer_items(item[_str], `table_select('${item[_str]}')`, 'table_')
    }


});


    socket.emit('show_db');


socket.on('show_databases', (_data)=>{

    

    add_explorer();

    _data.forEach(item => {
        add_data_explorer_items(item, `show_tables('${item}')`, 'db')
    });

});

const add_data_explorer_items = (name, func, _img) =>{

    let _string = `<li id="${name}" class="explorer" onclick="${func}"> <span class="db-view ${_img}"></span> ${name} </li>`;
    
    getID('data_explorer').insertAdjacentHTML('afterbegin', _string);

};

const add_explorer = () =>{

    if(getID('data_explorer')!=null){getID('data_explorer').remove();}
    let _string = `<ul style="list-style-type: none; display: flex;" id="data_explorer"></ul>`;
    
    getID('explorer_container').insertAdjacentHTML('afterbegin', _string);

};

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

const table_select = (table_name) =>{
    add_explorer();
    add_data_explorer_items('Index', `describe_table('${table_name}')`, 'describe_table');
    add_data_explorer_items('Content', `show_content('${table_name}')`, 'show_table');
};

const describe_table = (_id) =>{
    socket.emit('show_table_content', _id);
}

//Data-Explorer

const explorer_navbar_index = 0;
const actual_index = 0;

const navbar_info_index = (_str /*: string*/, _index /*: integer */) => {
    getID(`navbar_${(_index)}`).className = 'breadcrumb-item';
    let elem_code = `<li class="breadcrumb-item active" id="navbar_${_index}"> ${_str} </li>`;
    getID('explorer-navbar').insertAdjacentHTML('beforeend', elem_code);
};

const show_tables = (_str) => {
    navbar_info_index('Tables', actual_index);
    db_select(_str)
};