# AI Injury Risk Predictor

A React-based web application that provides real-time biomechanical analysis to predict injury risk during various exercises. This system analyzes movement patterns and provides immediate feedback to help prevent sports injuries.

## Features

- **Real-time Movement Analysis**: Live camera feed analysis with biomechanical assessment
- **Multi-Exercise Support**: Supports 6 different exercises (Squat, Jump Landing, Lunge, Overhead Press, Deadlift, Running Gait)
- **Risk Assessment**: Color-coded risk levels with percentage scores
- **Real-time Feedback**: Immediate recommendations and corrective cues
- **Detailed Metrics**: Exercise-specific biomechanical measurements
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Supported Exercises

1. **Squat** - Analyzes knee valgus, forward lean, depth, and symmetry
2. **Jump Landing** - Evaluates landing mechanics, ankle alignment, and impact forces
3. **Lunge** - Monitors knee tracking, hip drop, trunk lean, and stability
4. **Overhead Press** - Assesses shoulder mobility, spinal extension, and core stability
5. **Deadlift** - Examines spine neutrality, knee tracking, and bar path
6. **Running Gait** - Analyzes stride patterns, cadence, and foot strike

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-injury-risk-predictor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Technologies Used

- **React 18** - Frontend framework
- **Tailwind CSS** - Styling and responsive design
- **Lucide React** - Icon library
- **WebRTC** - Camera access for live video feed

## How It Works

1. **Pose Detection**: The system analyzes body landmarks and joint positions in real-time
2. **Biomechanical Analysis**: Calculates key risk factors like knee valgus and movement asymmetry
3. **Risk Prediction**: Machine learning algorithms predict injury probability and provide feedback

## Usage

1. Select an exercise from the dropdown menu
2. Click "Start Analysis" to begin camera feed and movement analysis
3. Perform the selected exercise in front of the camera
4. View real-time risk assessment and feedback
5. Follow the provided recommendations to improve movement quality

## Risk Levels

- **Safe (0%)**: Excellent form, low injury risk
- **Low Risk (1-25%)**: Good form with minor areas for improvement
- **Moderate Risk (26-50%)**: Some concerning movement patterns detected
- **High Risk (51%+)**: Multiple risk factors present, immediate attention needed

## Future Enhancements

- Integration with actual pose detection libraries (MediaPipe, PoseNet)
- Machine learning model training on real biomechanical data
- Video recording and analysis playback
- Progress tracking and historical data
- Integration with wearable devices

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Disclaimer

This application is for educational and demonstration purposes. It should not be used as a substitute for professional medical or fitness advice. Always consult with qualified healthcare providers before starting any exercise program.