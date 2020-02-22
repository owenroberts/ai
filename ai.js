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

	function randomEnding(str) {
		const re = new RegExp('^' + str, "g");
		const endings = data.endings[str[0].toLowerCase()]
			.filter(ending => ending.match(re));
		const ending = endings[Math.floor(Math.random() * endings.length)];
		return ending ? ending.substring(str.length, ending.length) : '';
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

		// capitalize beginning of text
		text = text.replace(/^[a-z]+$/g, txt => {
			return txt[0].toUpperCase() + txt.substring(1);
		});

		// capitize new sentence 
		text = text.replace(/[\.\?\!]\s*[a-z]+$/g, txt => {
			const index = /[a-z]/i.exec(txt).index;
			return txt.substring(0, index) + txt[index].toUpperCase() + txt.substring(index + 1);
		});

		// capitalize i 
		text = text.replace(/\bi\s/g, 'I ');

		// word after space
		if (text.match(/[a-zA-Z]+\s$/g) && Math.random() > 0.10) {
			comp.value = text + randomWord();
			instructions.style.opacity = 1;
		} 

		// ending after one letter
		else if (text.match(/\b[a-z]+$/g)) {
			const suggestion = randomEnding(text.match(/\b[a-z]+$/g)[0]);
			if (suggestion) {
				instructions.style.opacity = 1;
				comp.value = text + suggestion;
				if (Math.random() > 0.20) comp.value += ' ' + randomWord();
			}
		}

		// no prediction 
		else {
			instructions.style.opacity = 0;
		}
		
		user.value = text;
	});

	/* swipe to accept */
	if (mob) {
		instructions.style.display = 'block';
		button.addEventListener('touchstart', accept);

		let startX, startY, startTime;
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