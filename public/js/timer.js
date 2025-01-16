export class Timer {
    constructor(workerPath) {
        this.worker = new Worker(workerPath);
    }

    startTimer(initialTime, onUpdate, onFinish) {
        const halfTime = Math.floor(initialTime / 2);

        // Send start command and initial values to the worker
        this.worker.postMessage({ command: 'start', remainingTime: initialTime, halfTime });

        // Listen for messages from the worker
        this.worker.onmessage = function (e) {
            const { timeLeft } = e.data;

            if (timeLeft > 0) {
                onUpdate(timeLeft);

                // Trigger notifications at specific times
                if (timeLeft === 180 || timeLeft === halfTime) {
                    triggerNotifications();
                }
            } else {
                onFinish();
            }
        };
    }

    stopTimer() {
        this.worker.postMessage({ command: 'stop' });
    }

    terminateTimer() {
        this.worker.terminate();
    }
}

// Function to trigger notifications (replace with your logic)
function triggerNotifications() {
    console.log("Notification triggered!");
}
