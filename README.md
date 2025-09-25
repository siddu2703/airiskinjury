# 🏃‍♂️ AI Injury Risk Predictor

A comprehensive React-based web application that provides real-time biomechanical analysis to predict injury risk during various exercises. This system analyzes movement patterns and provides immediate feedback to help prevent sports injuries.

🌐 **Live Demo**: https://siddu2703.github.io/airiskinjury

## ✨ Key Features

### 🎥 Dual Analysis Modes
- **Live Camera Analysis**: Real-time movement assessment using webcam
- **Video Analysis**: Upload videos or analyze YouTube content with demo presets

### 🏋️ Multi-Exercise Support
Supports 6 different exercises with specific biomechanical analysis:
1. **Squat** 🏋️‍♀️ - Knee valgus, forward lean, depth, symmetry
2. **Jump Landing** 🏀 - Landing mechanics, ankle alignment, impact forces
3. **Lunge** 🤸‍♀️ - Knee tracking, hip drop, trunk lean, stability
4. **Overhead Press** 🏋️‍♂️ - Shoulder mobility, spinal extension, core stability
5. **Deadlift** 💪 - Spine neutrality, knee tracking, bar path
6. **Running Gait** 🏃‍♂️ - Stride patterns, cadence, foot strike

### 📊 Advanced Analytics
- **Color-coded Risk Assessment**: Visual risk levels with percentage scores
- **Real-time Metrics**: Exercise-specific biomechanical measurements
- **Intelligent Feedback**: Contextual recommendations and corrective cues
- **Professional Reporting**: Detailed analysis with actionable insights

## 🎬 Demo Videos for Presentations

The Video Analysis mode includes curated demo videos perfect for presentations:

### Perfect Squat Form - Low Risk ✅
- Demonstrates excellent technique
- Shows low injury risk assessment
- Green indicators and positive feedback

### Poor Squat Form - High Risk ⚠️
- Illustrates common mistakes
- Triggers high-risk alerts
- Red indicators with corrective recommendations

### Jump Landing Analysis - Moderate Risk 🟡
- Balanced risk assessment
- Mixed feedback for educational purposes

## 🚀 Quick Start

### Option 1: Use Live Demo
Visit **https://siddu2703.github.io/airiskinjury** and start analyzing immediately!

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/siddu2703/airiskinjury.git
cd airiskinjury

# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

## 🎯 How to Use for Presentations

### 1. **Live Camera Demo**
- Click "Live Camera" tab
- Select exercise type (Squat recommended)
- Click "Start Analysis"
- Demonstrate movement in front of camera
- Show real-time risk assessment and feedback

### 2. **Video Analysis Demo**
- Click "Video Analysis" tab
- Choose from preset demo videos:
  - **Perfect Squat Form**: Shows low risk (green)
  - **Poor Squat Form**: Shows high risk (red)
  - **Jump Landing**: Shows moderate risk (yellow)
- Click "Start Analysis" to see automatic assessment
- Explain the biomechanical metrics and recommendations

### 3. **Custom Video Analysis**
- Upload your own exercise videos
- Paste YouTube URLs for analysis
- Compare different movement patterns

## 🛠️ Technical Architecture

### Frontend Technologies
- **React 18** - Modern component-based architecture
- **React Router** - Navigation between analysis modes
- **Tailwind CSS** - Responsive design system
- **Lucide React** - Professional iconography

### Analysis Engine
- **Biomechanical Algorithms** - Movement pattern recognition
- **Risk Assessment Models** - Multi-factor injury prediction
- **Real-time Processing** - 100ms analysis intervals
- **Smart Feedback System** - Contextual recommendations

### Browser APIs
- **MediaDevices API** - Camera access for live analysis
- **File API** - Video upload functionality
- **Canvas API** - Real-time visualization overlays

## 📈 Risk Assessment Methodology

### Risk Calculation
Each exercise has weighted risk factors:
- **High Risk**: Exceeds danger thresholds (50%+ total risk)
- **Moderate Risk**: Moderate concern levels (25-50% total risk)
- **Low Risk**: Minor issues detected (1-25% total risk)
- **Safe**: Excellent form (0% risk)

### Biomechanical Metrics
- **Angular Measurements**: Joint angles and deviations
- **Symmetry Analysis**: Left vs right side comparison
- **Range of Motion**: Depth and mobility assessment
- **Stability Metrics**: Balance and control evaluation

## 🎨 User Experience

- **Intuitive Navigation**: Clear mode switching
- **Real-time Feedback**: Immediate visual and textual cues
- **Professional Design**: Clean, medical-grade interface
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Accessibility**: Screen reader compatible, keyboard navigation

## 🔬 Use Cases

### Healthcare & Rehabilitation
- Physical therapy assessment
- Post-injury movement screening
- Progress tracking and documentation

### Sports & Fitness
- Athletic performance optimization
- Injury prevention programs
- Technique coaching and correction

### Education & Research
- Biomechanics education
- Movement science demonstrations
- Research data collection

## 📱 Browser Compatibility

- **Chrome/Edge**: Full feature support
- **Firefox**: Complete functionality
- **Safari**: Camera access supported
- **Mobile**: Responsive design, touch-friendly

## 🚀 Deployment

### GitHub Pages (Current)
```bash
npm run deploy
```

### Custom Hosting
```bash
npm run build
# Deploy 'build' folder to your hosting provider
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Important Disclaimer

This application is designed for **educational and demonstration purposes only**. It should not be used as a substitute for professional medical, physical therapy, or fitness advice.

**Always consult with qualified healthcare providers before:**
- Starting any exercise program
- Making changes to rehabilitation protocols
- Interpreting injury risk assessments

The AI analysis provides general movement quality feedback and should not be considered a medical diagnosis or professional assessment.

## 📞 Support & Feedback

- **Issues**: Report bugs via [GitHub Issues](https://github.com/siddu2703/airiskinjury/issues)
- **Feature Requests**: Submit enhancement ideas
- **Documentation**: Contribute to project documentation

---

**Built with ❤️ for better movement and injury prevention**
