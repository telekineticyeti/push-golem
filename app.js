let express = require('express');
let app = express();
let PushBullet = require('pushbullet');
let Promise = require('bluebird');

let pusher = new PushBullet(process.env.PUSHBULLET_API_KEY);

app.listen(8000, () => {
	console.log('Push Golem is listening');
});

app.get('/list', (req, res, next) => {
	device_list()
		.then(data => {
			res.type('application/json');
			res.send(JSON.stringify(data, null, 4));
			res.end();
		})
		.catch((error) => {
			res.status(500).send(json_output({ code: 500, status: "error", message: '' + error })).end();
		});
});


app.get('/note/:target', (req, res, next) => {
	let target = req.params.target;
	let title = req.query.title;
	let body = req.query.body;

	// Variables for error handling
	let proceed = true;
	let error_message = [];

	if (!target || target === "") {
		proceed = false;
		error_message.push("A target device must be specified");
	}
	if (!title || title === "") {
		proceed = false;
		error_message.push("A note title must be specified");
	}
	if (!body || body === "") {
		proceed = false;
		error_message.push("A note body must be specified");
	}

	if (proceed) {
		send_note(target, title, body) 
			.then(data => {
				res.send(JSON.stringify(data, null, 4));
				res.end();
				res.status(500).send(json_output({ code: 500, status: "error", message: error_message })).end();
			})
			.catch((error) => {
				res.status(500).send(json_output({ code: 500, status: "error", message: error })).end();
			});
	} else {
		res.status(500).send(json_output({ code: 500, status: "error", message: error_message })).end();
	}
});


function json_output(object) {
	return JSON.stringify(object , null, 4)
}


function device_list() {
	return new Promise((resolve, reject) => {
		pusher.devices(function(error, response) {
			if (error) {
				reject(error);
			} else {
				resolve(response);
			}
		});
	});
}


function send_note(device, title, body) {
	return new Promise((resolve, reject) => {
		pusher.note(device, title, body, function(error, response) {
			if (error) {
				reject(error);
			} else {
				resolve(response);
			}
		});
	});
}