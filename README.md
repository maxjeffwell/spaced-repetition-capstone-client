# IntervalAI

A neural-enhanced spaced repetition learning system that uses machine learning to optimize vocabulary review timing for maximum retention.

## Overview

IntervalAI combines the proven SM-2 spaced repetition algorithm with a custom neural network that learns individual user patterns. The system predicts optimal review intervals to maximize memory retention while minimizing redundant reviews.

## Key Features

- **ML-Powered Scheduling**: 8-layer neural network (961 parameters) predicts optimal review intervals
- **96.1% Improvement**: Over baseline SM-2 algorithm (MAE: 0.0735 days vs 1.8889 days)
- **WebGPU Acceleration**: Hardware-accelerated ML inference with automatic fallbacks
- **A/B Testing**: Built-in performance comparison between algorithms
- **Real-time Predictions**: <1ms inference time with WebGPU
- **Personalized Learning**: Adapts to individual user patterns and learning speed

## Technology Stack

### Frontend
- React 18.3.1 with Redux
- TensorFlow.js 4.22.0 + WebGPU backend
- Chart.js for visualization
- React Router DOM 6.30.1

### Backend
- Node.js with Express
- MongoDB with Mongoose
- TensorFlow.js Node 4.22.0
- Passport.js + JWT authentication

## Frontend Features

- React-based learning interface with Redux state management
- Interactive quiz system for language learning
- WebGPU-accelerated ML inference (with fallback support)
- Real-time predictions of optimal review intervals
- ML status dashboard
- A/B testing interface comparing baseline vs ML algorithm performance
- Progress tracking and statistics visualization

## Project Structure

```
intervalai/
├── spaced-repetition-capstone-client/  (React frontend)
│   ├── src/
│   │   ├── components/      (UI components)
│   │   ├── actions/         (Redux actions)
│   │   ├── reducers/        (Redux reducers)
│   │   └── services/        (ML service, API calls)
│   └── public/
└── spaced-repetition-capstone-server/  (Node.js backend)
    ├── algorithms/         (SM-2, ML algorithms)
    ├── ml/                (Neural network model)
    ├── models/            (MongoDB schemas)
    ├── routes/            (API endpoints)
    ├── auth/              (Authentication)
    └── scripts/           (Training & data scripts)
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (for backend)
- npm

### Full System Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd spaced-repetition-capstone
```

2. Install client dependencies:
```bash
cd spaced-repetition-capstone-client
npm install
```

3. Install server dependencies:
```bash
cd ../spaced-repetition-capstone-server
npm install
```

4. Configure environment variables:
Create a `.env` file in the server directory:
```
MONGODB_URI=mongodb://localhost:27017/spaced-repetition
JWT_SECRET=your-secret-key
CLIENT_ORIGIN=http://localhost:3000
```

Create a `.env` file in the client directory (optional):
```
REACT_APP_API_BASE_URL=http://localhost:8080
```

### Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the backend server (in one terminal):
```bash
cd spaced-repetition-capstone-server
npm run dev
```

3. Start the frontend (in another terminal):
```bash
cd spaced-repetition-capstone-client
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Client-Only Development

If you're only working on the frontend:

```bash
npm install
npm start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

### Testing

```bash
npm test
```

Launches the test runner in interactive watch mode.

## Performance Metrics

- **Training samples**: 72 | **Test samples**: 18
- **Mean Absolute Error (MAE)**: 0.0735 days
- **Baseline MAE**: 1.8889 days
- **Improvement**: 96.1% over baseline
- **Inference time**: <1ms (WebGPU)
- **Model size**: 961 parameters

## Feature Engineering

The ML model uses 8 input features:
- Memory strength
- Difficulty rating
- Time since last review
- Success rate
- Average response time
- Total reviews
- Consecutive correct answers
- Time of day

## Backend Repository

For backend documentation, see: [IntervalAI Server](https://github.com/maxjeffwell/spaced-repetition-capstone-server)

## Deployment

The application is configured for deployment to Render or similar platforms. See `render.yaml` for deployment configuration.

## License

MIT

## About

IntervalAI was developed as a capstone project demonstrating the integration of machine learning with spaced repetition learning systems.

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
