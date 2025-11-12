# IntervalAI - Client

The frontend application for IntervalAI, a neural-enhanced spaced repetition learning system.

## Overview

IntervalAI uses machine learning to optimize the timing of vocabulary review sessions, helping you learn more efficiently than traditional spaced repetition algorithms.

## Features

- React-based learning interface with Redux state management
- Interactive quiz system for language learning
- WebGPU-accelerated ML inference (with fallback support)
- Real-time predictions of optimal review intervals
- ML status dashboard
- A/B testing interface comparing baseline vs ML algorithm performance
- Progress tracking and statistics visualization

## Technology Stack

- React 18.3.1
- Redux (state management)
- TensorFlow.js 4.22.0
- TensorFlow.js WebGPU backend 4.22.0
- Chart.js 4.5.1
- React Router DOM 6.30.1

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Development

```bash
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

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

For more information about the IntervalAI system, see the main project documentation.
