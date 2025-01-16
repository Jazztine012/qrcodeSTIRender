let intervalId;

onmessage = function (e) {
    const { command, remainingTime, halfTime } = e.data;

    if (command === 'start') {
        let timeLeft = remainingTime;

        intervalId = setInterval(() => {
            timeLeft--;

            // Post the remaining time back to the main thread
            postMessage({ timeLeft });

            // Stop the timer when it reaches zero
            if (timeLeft <= 0) {
                clearInterval(intervalId);
                postMessage({ timeLeft: 0 });
            }
        }, 1000);
    }

    if (command === 'stop') {
        clearInterval(intervalId);
    }
};
