function getFiles() {
    var rootpath = "/pentaho/api/repo/files/:home:admin/children?filter=*.saiku";
    var request = new XMLHttpRequest();
    request.open("GET", rootpath, false);
    request.send();
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(request.responseText, "text/xml");
    var names = xmlDoc.getElementsByTagName("name");
    var sel = document.getElementById("files");
    for (var i of names){
        opt = document.createElement("option");
        opt.appendChild(document.createTextNode(i.childNodes[0].nodeValue));
        sel.appendChild(opt);
    }
}

function getData(filename) {
    var rootpath = "/pentaho/plugin/saiku/api/admin/export/saiku/json?file=/home/admin/" + filename;
    var request = new XMLHttpRequest();
    request.open("GET", rootpath, false);
    request.send();
    var json = JSON.parse(request.responseText);
    return json;
}

function createTable(json) {
    var table = document.getElementById("analysis"); 
    var html = "";
    var val = "";
    var nullcount = 0;
    var colspan = 1;
    for (i = 0; i < json.height; i++) {
        html += "<tr>";
        for (j = 0; j < json.width; j++) {
            if (json.cellset[i][j].value != "null") {
                if(colspan == 1){
                    if (json.cellset[i][j].value != val) {
                        val = json.cellset[i][j].value
                        html += "<td>" + val + "</td>";
                    } else {
                        colspan++;
                    }
                } else {
                    if (json.cellset[i][j].value == val) {
                        colspan++;
                        if (j == json.width - 1) {
                            html = html.substring(0, html.length-9-val.length);
                            html += "<td colspan=\"" + colspan + "\">" + val + "</td>";
                            colspan = 1;
                        }
                    } else {
                        html = html.substring(0, html.length-9-val.length);
                        html += "<td colspan=\"" + colspan + "\">" + val + "</td>";
                        colspan = 1;
                        val = json.cellset[i][j].value
                        html += "<td>" + val + "</td>";
                    }
                }
            } else {
                nullcount++;
                html += "<td>" + "</td>";
            }
        }
        html += "</tr>";
    }
    table.innerHTML = html;
    for (i = 1; i < nullcount; i++) {
        table.rows[i].deleteCell(0);
    }
    table.rows[0].cells[0].rowSpan = nullcount;
    document.body.appendChild(table);
}

function getTable(){
    var sel = document.getElementById("files");
    var opt = sel.options[sel.selectedIndex].text;
    if (opt != "Выбрать") {
        var json = getData(opt);
        createTable(json);
    }
}