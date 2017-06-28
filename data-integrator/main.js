var arr, json;

function getColsArr() {
    var end,
        table = document.getElementById('data');
    
    for (i = getColHeadNum()-1; i >= 0; i--) {
        for (j = getRowHeadNum(); j < json.width; j++) {
            if (arr[i][j]) {
                end = j + table.rows[i].cols[j].colSpan;
                for (c = j; c < end; c++) {
                    for (r = getColHeadNum(); r < json.length; r++) {
                        arr[r][c] = true;
                    }
                }
            }
        }
    }
    console.log(arr);
}

function exportSelected() {
    // var data = [];
    // var height = -1;
    // var width = 0;
    // var lasti = 0;
    var colsArr = getColsArr();
    // var rows = getRows();
    // console.log(arr);
    // for(i = 0; i < json.height; i++){
        // for (j = 0; j < json.width; j++) {
            // if(arr[i][j]){
                // if(lasti != i){
                    // lasti = i;
                    // height++;
                    // data.cellset[height] = [];
                // }
                // data[height].push(json.cellset[i][j].value);
            // }
        // }
    // }
    // height++;
    // width++;
    // console.log(JSON.stringify(data));
}

// WITH
// SET [~COLUMNS] AS
    // Hierarchize({{[Store].[Store Country].Members}, {[Store].[Store State].Members}, {[Store].[Store City].Members}, {[Store].[Store Name].Members}})
// SET [~ROWS] AS
    // {[Product].[Product Family].Members}
// SELECT
// NON EMPTY [~COLUMNS] ON COLUMNS,
// NON EMPTY [~ROWS] ON ROWS
// FROM [Sales]

function getData(filename) {
    var rootpath = '/pentaho/plugin/saiku/api/admin/export/saiku/json?file=/home/admin/' + filename,
    request = new XMLHttpRequest();
    
    request.open('GET', rootpath);
    request.onload = function (e) {
        if (request.readyState === 4 && request.status === 200) {
            json = JSON.parse(request.responseText);
            createTable();
            arr = refreshArray();
        }
    };
    request.send(); 
}

function getColHeadNum() {
    for(colHeadNum = 0; colHeadNum < json.height; colHeadNum++){
        if(json.cellset[colHeadNum][json.width-1].type !== 'COLUMN_HEADER')
            return colHeadNum;
    }
}

function getRowHeadNum() {
    for(rowHeadNum = 0; rowHeadNum < json.width; rowHeadNum++){
        if(json.cellset[json.height-1][rowHeadNum].type !== 'ROW_HEADER')
            return rowHeadNum;
    }
}

function createTable() {
    var table = document.getElementById('data'),
        tr,
        td,
        val = '',
        colspan = 1,
        same = false,
        cellset = json.cellset;
    
    for (i = 0; i < json.height; i++) {
        tr = table.insertRow();
        for (j = 0; j < json.width; j++) {
            if (cellset[i][j].type === 'DATA_CELL') {
                td = tr.insertCell();
                td.appendChild(document.createTextNode(cellset[i][j].value));
            } else if (cellset[i][j].value !== val) {
                if (colspan > 1) {
                    th.colSpan = colspan;
                    th.id = j-colspan+1;
                    colspan = 1;
                }
                val = cellset[i][j].value
                th = document.createElement('th');
                tr.appendChild(th);
                th.appendChild(document.createTextNode(val));
            } else {
                colspan++;
                if (j === json.width - 1) {
                    th.colSpan = colspan;
                    colspan = 1;
                }
            }
        }
    }
    
    for (j = 0; j < getRowHeadNum(); j++) {
        for (i = getColHeadNum(); i < json.height-1; i++) { 
            if (cellset[i][j].value === cellset[i+1][j].value) {
                if (!same) {
                    same = true;
                    table.rows[i].cells[j].className = 'fst';
                    continue;
                }
                if (i === json.height-2) {
                    table.rows[i+1].cells[j].className = 'last';
                    table.rows[i+1].cells[j].innerHTML = '';
                    same = false;
                }
                table.rows[i].cells[j].className = 'mid';
                table.rows[i].cells[j].innerHTML = '';
            } else {
                if (same) {
                    same = false;
                    table.rows[i].cells[j].className = 'last';
                    table.rows[i].cells[j].innerHTML = '';
                }
            }
        }
    }
    
    if(cellset[0][0].value === 'null') {
        for (i = 0; i < getColHeadNum()-1; i++) {
            for (j = 0; j < getRowHeadNum(); j++) {
                table.rows[i].cells[j].innerHTML = '';
                table.rows[i].cells[j].className = 'empty';
            }
        }
    }
}

function getFiles() {
    var rootpath = '/pentaho/api/repo/files/:home:admin/children?filter=*.saiku',
        request = new XMLHttpRequest();
        
    request.open('GET', rootpath);
    
    var func = function f(e) {
        if (request.readyState === 4 && request.status === 200) {
            var parser = new DOMParser(),
                xmlDoc = parser.parseFromString(request.responseText, 'text/xml'),
                names = xmlDoc.getElementsByTagName('name');
                
            for (var i of names){
                $('#files').append('<option>'+i.childNodes[0].nodeValue+'</option>');
            }
        }
    };
    request.onload = func;
    request.send();
}

/* function refreshArray() {
    var array = [];
        
    for(i = 0; i < json.height; i++){
        array[i] = [];
        //width = $('#data tr').eq(i).find('td').length;
        for(j = 0; j < json.width; j++){
            array[i][j] = false;
        }
    }
    return array;
} */

function refreshArray() {
    arr = [];
    for(i = 0; i < json.height; i++){
        arr[i] = [];
        for(j = 0; j < json.width; j++){
            arr[i][j] = false;
        }
    }
}

function setCellClick() {
    var func = function f() {
        var i = $(this).parent('tr').index(),
            j = $(this).index();
            
        if ($(this).hasClass('fst')) {
            for (i; ; i++) {
                arr[i][j] = !arr[i][j];
                $('#data tr').eq(i).find('th').eq(j).toggleClass('click');
                if ($('#data tr').eq(i).find('th').eq(j).hasClass('last'))
                    break;
            }
        } else if ($(this).hasClass('mid')) {
            for (r=i-1; ; r--) {
                arr[r][j] = !arr[r][j];
                $('#data tr').eq(r).find('th').eq(j).toggleClass('click');
                if ($('#data tr').eq(r).find('th').eq(j).hasClass('fst'))
                    break;
            }
            for (i; ; i++) {
                arr[i][j] = !arr[i][j];
                $('#data tr').eq(i).find('th').eq(j).toggleClass('click');
                if ($('#data tr').eq(i).find('th').eq(j).hasClass('last'))
                    break;
            }
        } else if ($(this).hasClass('last')) {
            for (i; ; i--) {
                arr[i][j] = !arr[i][j];
                $('#data tr').eq(i).find('th').eq(j).toggleClass('click');
                if ($('#data tr').eq(i).find('th').eq(j).hasClass('fst'))
                    break;
            }
        } else {
            $(this).toggleClass('click');
            arr[i][j] = !arr[i][j];
        }
    };
    $('#data').on('click', 'th', func);
}


function back(){
    $('#data tr').remove();
    $('#back').hide();
    $('#exp').hide();
    $('#exec').show();
    $('#files').show();
}

function getTable(){
    var opt = $('#files option:selected').text();
    
    $('#exec').hide();
    $('#files').hide();
    $('#back').show();
    $('#exp').show();
    
    if (opt !== 'Select query file') {
        getData(opt);
    }
}