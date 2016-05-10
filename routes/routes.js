var moment = require('moment');
var path    = require("path");

var appRouter = function(app) {

	app.get("/", function(req,res) {
		var fileName = path.join(__dirname+'/../dist/index.html');
		console.log("inside root get request: " + fileName);
		res.sendFile(fileName);
	})

	app.get("/lineup", function(req, res) {
		var date = req.query.date;
		if(date) {
			date = moment(date, "YYYY-MM-DD");
		}
		console.log("date: " + date);
		res.send("hi");
	});
}
 
module.exports = appRouter;