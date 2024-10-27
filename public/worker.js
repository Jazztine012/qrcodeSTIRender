let intervalId;

onmessage = function (e) {
    const { command, duration } = e.data;

    if (command === 'start') {
        let timeRemaining = duration;

        intervalId = setInterval(() => {
            timeRemaining -= 1;
            postMessage({ timeRemaining });

            if (timeRemaining <= 0) {
                clearInterval(intervalId);
                postMessage({ timeRemaining: 0 });
            }
        }, 1000);
    }

    if (command === 'stop') {
        clearInterval(intervalId);
        postMessage({ timeRemaining: 0 });
    }
};
