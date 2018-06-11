//Make connection

var socket = io.connect('http://localhost:3000');

//Query DOM
let message = document.getElementById('message');
	handle = document.getElementById('handle');
	btn = document.getElementById('send');
	output = document.getElementById('output');
	feedback = document.getElementById('feedback');

//Emit events
btn.addEventListener('click', function(){
	socket.emit('chat', {
		message: message.value,
		handle: handle.value
	});
	message.value = '';
});

message.addEventListener('keypress', function(){
	socket.emit('typing', handle.value);
});

//Listen for events
socket.on('chat', function(data){
	feedback.innerHTML = '';
	msg = `<p><strong>${data.handle}: </strong>${data.message}</p>`;
	output.innerHTML += msg;
});

socket.on('typing', function(data){
	feedback.innerHTML = `<p><em>${data} is typing a message...</em></p>`;
});