function getFiles(host) {
    var rootpath = "http://" + host + "/pentaho/api/repo/files/:home:admin/children?filter=*.saiku";
    var request = new XMLHttpRequest();
    request.open("GET", rootpath, false);
    request.send();
    var files = document.getElementById("files");
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(request.responseText, "text/xml");
    var names = xmlDoc.getElementsByTagName("name");
    var html = "";
    for (var i of names){
        html+=i.childNodes[0].nodeValue;
    }
    files.innerHTML = html;
}

function getData(host, filename) {
    var rootpath = "http://" + host + "/pentaho/plugin/saiku/api/admin/export/saiku/json?file=/home/" + filename;
    var request = new XMLHttpRequest();
    request.open("GET", rootpath, false);
    request.send();
    var json = JSON.parse(request.responseText);
    return json;
}

function createTable(json) {
    var table = document.createElement("table");
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