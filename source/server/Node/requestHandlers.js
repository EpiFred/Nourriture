var http = require("http");
var fs = require("fs");
var formidable = require("formidable");

function start(response)
{
    console.log("Request handler 'start' was called.");

    var body = '<html>'+
	'<head>'+
	'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'+
	'</head>'+
	'<body>'+
	'<form action="/upload" enctype="multipart/form-data" method="POST">'+
	'<input type="file" name="upload" multiple="multiple">'+
	'<input type="submit" name="OK" />' +
	'</form>'+
	'</body>'+
	'</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, request)
{
    console.log("Request handler 'upload' was called.");

    var form = new formidable.IncomingForm();
    console.log("about to parse");
    form.parse(request, function(error, fields, files)
	      {
		  console.log("parsing done");
		  fs.renameSync(files.upload.path, "/tmp/test.png");
		  response.writeHead(200, {"Content-Type": "text/html"});
		  response.write("<img src='/show' />");
		  response.end();
	      });
}

function show(response)
{
    console.log("Request handler 'show' was called.");
    fs.readFile("/tmp/test.png", "binary", function(error, file)
		{
		    if (error)
		    {
			response.writeHead(500, {"Content-Type": "text/html"});
			response.write(error + "\n");
			response.end();
		    }
		    else
		    {
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write(file, "binary");
			response.end();
		    }
		});
}

exports.start = start;
exports.upload = upload;
exports.show = show;