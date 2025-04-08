class DataStreamProcessor {
    constructor(windowSize = 5, alpha = 0.5) {
        this.windowSize = windowSize;
        this.alpha = alpha;
        this.dataWindow = [];
        this.lastEma = null;
    }

    // Add new data point
    processDataPoint(point) {
        this.dataWindow.push(point);
        if (this.dataWindow.length > this.windowSize) {
            this.dataWindow.shift();
        }

        return {
            raw: point,
            movingAverage: this.movingAverage(),
            exponentialMovingAverage: this.exponentialMovingAverage(point),
        };
    }

    // Moving Average
    movingAverage() {
        const sum = this.dataWindow.reduce((acc, val) => acc + val, 0);
        return +(sum / this.dataWindow.length).toFixed(2);
    }

    // Exponential Moving Average (EMA)
    exponentialMovingAverage(current) {
        if (this.lastEma == null) this.lastEma = current;
        this.lastEma = this.alpha * current + (1 - this.alpha) * this.lastEma;
        return +this.lastEma.toFixed(2);
    }
}

// Simulated data stream
function startDataStream() {
    const processor = new DataStreamProcessor(5, 0.3);

    setInterval(() => {
        const rawData = simulateSensorData();
        const result = processor.processDataPoint(rawData);

        console.log(`[RAW: ${result.raw}] → MA: ${result.movingAverage}, EMA: ${result.exponentialMovingAverage}`);
    }, 1000);
}

// Simulate noisy sensor data (sine wave + random noise)
function simulateSensorData() {
    const time = Date.now() / 1000;
    const baseSignal = 512 + 100 * Math.sin(time / 10);
    const noise = (Math.random() - 0.5) * 30; // noise in range [-15, 15]
    let analogValue = baseSignal + noise;
    analogValue = Math.max(0, Math.min(1023, analogValue));
    return +analogValue.toFixed(0);
}

startDataStream();
