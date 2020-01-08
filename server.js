const http = require('http');
const url = require('url');
const fs = require('fs');
const newWS = new require('ws');

http.createServer(function (req, res) {
    let reqList = url.parse(req.url, true);
    let filePath = '.' + reqList.pathname;
    if (filePath === "./front.html") {
        console.log(filePath);
        fs.readFile(filePath, function (err, data) {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'});
                return res.end('404 Not Found');
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            return res.end();
        });
    } else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('404 Not Found');
    }
}).listen(1234);

let webSS = new newWS.Server({
    port:1235
});

let writeGraph = function (graph, path) {
    let serverData = JSON.parse(fs.readFileSync(path));
    for (let i = 0; i < serverData.length; i++) {
        if (serverData[i].name == graph.name) {
            return -1;
        }
    }
    serverData.push(graph);
    fs.writeFileSync(path, JSON.stringify(serverData));
    return 0; //saved new graph
};
let getGraph = function (name, path) {
    let serverData = JSON.parse(fs.readFileSync(path));
    for (let i = 0; i < serverData.length; i++)
        if (serverData[i].name == name)
            return JSON.stringify(serverData[i]);
    return "nothing";
};
let deleteGraph = function (name, path) {
    let serverData = JSON.parse(fs.readFileSync(path));
    for (let i = 0; i < serverData.length; i++) {
        if (serverData[i].name == name)
            serverData.splice(i, 1);
    }
    fs.writeFileSync(path, JSON.stringify(serverData));
};
let getAll = function (path) {
    let serverData = JSON.parse(fs.readFileSync(path));
    return JSON.stringify(serverData.map(el => {
        return el.name;
    }));
};
let saveGraph = function (graph, path) {
    let serverData = JSON.parse(fs.readFileSync(path));
    for (let i = 0; i < serverData.length; i++) {
        if (typeof(graph) != "undefined" && graph !== null && serverData[i].name === graph.name) {
            serverData[i].nodes = graph.nodes;
        }
    }
    fs.writeFileSync(path, JSON.stringify(serverData));
};

webSS.on('connection', function(ws) {
    const file = "games.json";
    ws.on('message', function (message) {
        let userData = JSON.parse(message);
        if (userData.command == "getAll") {
            ws.send(getAll(file));
        } else if (userData.command == "getGraph") {
            ws.send(getGraph(userData.name, file));
        } else if (userData.command == "newGraph") {
            writeGraph(userData.data, file);
        } else if (userData.command == "saveGraph") {
            saveGraph(userData.data, file);
        } else if (userData.command == "deleteGraph") {
            deleteGraph(userData.name, file);
        } else {
            console.log('err');
        }
    });
});
