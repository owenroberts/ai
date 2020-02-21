async function fetchA() {
	let words = await ( await(fetch('words.json')) ).json();
	let endings = await( await fetch('endings.json') ).json();
	return {...words, endings: endings };
}
fetchA().then(data => { predict(data); });

function predict(data) {

	function randomWord() {
		return data.words[Math.floor(Math.random() * data.words.length)];
	}

	function randomEnding(letter) {
		letter = letter.toLowerCase();
		const ending = data.endings[letter][Math.floor(Math.random() * data.endings[letter].length)];
		return ending.substring(1, ending.length);
	}

	const user = document.getElementById('user');
	const comp = document.getElementById('computer');
	const mob = Cool.mobilecheck();
	const button = document.getElementById(mob ? 'swipe' : 'tab');
	const instructions = document.getElementById( mob ? 'swipe-right' : 'tab-btn' );

	user.focus();

	user.addEventListener('keydown', ev => {
		if (ev.which == 9) {
			ev.preventDefault();
			accept();
		}
		comp.value = '';
	});

	function accept() {
		if (comp.value) {
			const punc = Math.random() > 0.5 ? ' ' : '. ';
			user.value = comp.value + punc;
			instructions.style.opacity = 0;
		}
		comp.value = '';
	}

	user.addEventListener('keyup', ev => {
		if (ev.which == 9) {
			ev.preventDefault();
			button.classList.add('active');
			setTimeout(() => {
				button.classList.remove('active');
			}, 200);
		}

		let text = user.value;
		const lastChar = text[text.length - 1];

		// capitalize beginning of text and sentence, i
		if (text.match(/(^[a-z]$)|(.+?[\.\?\!]\s+[a-z]$)/g)) {
			text = text.substring(0, text.length - 1) + text[text.length - 1].toUpperCase();
		}

		// capitalize i 
		text = text.replace(/\bi\s/g, 'I ');

		// word after space
		if (text.match(/[a-zA-Z]+\s$/g) && Math.random() > 0.5) {
			comp.value = text + randomWord();
			instructions.style.opacity = 1;
		} 

		// ending after one letter
		else  if (text.match(/\b[a-z]$/g) && Math.random() > 0.25) {
			comp.value = text + randomEnding(text[text.length - 1]);
			instructions.style.opacity = 1;
		}

		// no prediction 
		else {
			instructions.style.opacity = 0;
		}


		user.value = text;
	});

	/* swipe to accept */
	if (mob) {
		document.getElementById('swipe-right').style.display = 'block';
		var startX, startY, startTime;
		const swipeTime = 200;
		const threshold = 50, restraint = 100;

		document.addEventListener('touchstart', ev => {
			// ev.preventDefault();
			const touchobj = ev.changedTouches[0];
			startX = touchobj.pageX;
			startY = touchobj.pageY;
			startTime = new Date().getTime();
		}, false);

		document.addEventListener('touchmove', function(ev) {
			// ev.preventDefault();
		}, false);

		document.addEventListener('touchend', function(ev) {
			// ev.preventDefault();
			let dir = 'none';
			const touchobj = ev.changedTouches[0];
			const distX = touchobj.pageX - startX;
			const distY = touchobj.pageY - startY;
			elapsedTime = new Date().getTime() - startTime;
			if (elapsedTime <= swipeTime) {
				if (Math.abs(distX) >= threshold &&
					Math.abs(distY) <= restraint &&
					distX > 0) {
					accept();
				}
			}
			return true;
		}, false);
	} else {
		document.getElementById('swipe-right').remove();
	}
}