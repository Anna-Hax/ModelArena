import Countdown from "react-countdown";

const CountdownTimer = ({ label, prediction, actual, baseTime, delayMinutes }) => {
  const targetTime = new Date(baseTime).getTime() + delayMinutes * 60 * 1000;

  const renderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      return (
        <div>
          <p><strong>{label} Prediction:</strong> {prediction}</p>
          <p>
            <strong>Actual:</strong>{" "}
            {actual !== null && actual !== undefined ? actual : <em>Waiting for actual value...</em>}
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <p><strong>{label} Prediction:</strong> {prediction}</p>
          <p>🕒 Actual in: {minutes}m {seconds}s</p>
        </div>
      );
    }
  };

  if (isNaN(targetTime)) {
    return (
      <div>
        <p><strong>{label} Prediction:</strong> {prediction}</p>
        <p className="text-red-500">⚠️ Invalid timestamp</p>
      </div>
    );
  }

  return <Countdown date={targetTime} renderer={renderer} />;
};

export default CountdownTimer;