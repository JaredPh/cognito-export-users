const term = require('terminal-kit').terminal;

let currentWait = 1;
let lastIncrement = 1;

const pad = string => `00${string}`.substr(-2);

const formatTime = time => `${pad((time - (time % 60)) / 60)}:${pad(time % 60)}`;

const messages = {
  during: t => `Requests will resume in: ${formatTime(t)}\n`,
  after: t => `Requests were paused for: ${formatTime(t)}\n`,
};

const wait = () => new Promise((resolve) => {
  const seconds = currentWait;
  let remainingTime = seconds;

  term.yellow(messages.during(remainingTime));

  const timer = setInterval(() => {
    remainingTime -= 1;
    if (remainingTime > 0) {
      term
        .up(1)
        .eraseLineAfter()
        .yellow(messages.during(remainingTime));
    } else {
      clearInterval(timer);

      term
        .up(1)
        .eraseLineAfter()
        .cyan(messages.after(seconds));

      resolve();
    }
  }, 1000);
});

const increaseWaitTime = () => {
  currentWait += lastIncrement;
  lastIncrement = currentWait - lastIncrement;
};

const resetWaitTime = () => {
  currentWait = 1;
  lastIncrement = 1;
};

module.exports = {
  wait,
  increaseWaitTime,
  resetWaitTime,
};
