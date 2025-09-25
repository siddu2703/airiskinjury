import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Activity, BarChart3, Upload, Play } from 'lucide-react';

// Import the same configuration from the main component
const EXERCISE_CONFIG = {
  squat: {
    name: 'Squat',
    icon: '🏋️‍♀️',
    metrics: ['kneeValgus', 'forwardLean', 'depth', 'symmetry'],
    riskFactors: {
      kneeValgus: { threshold: 15, moderate: 8, label: 'Knee Valgus', unit: '°', weight: 35 },
      forwardLean: { threshold: 45, moderate: 30, label: 'Forward Lean', unit: '°', weight: 25 },
      depth: { threshold: 70, moderate: 80, label: 'Squat Depth', unit: '%', inverse: true, weight: 15 },
      symmetry: { threshold: 85, moderate: 90, label: 'Movement Symmetry', unit: '%', inverse: true, weight: 20 }
    }
  },
  jump: {
    name: 'Jump Landing',
    icon: '🏀',
    metrics: ['kneeValgus', 'ankleAlignment', 'landingForce', 'asymmetry'],
    riskFactors: {
      kneeValgus: { threshold: 12, moderate: 6, label: 'Landing Knee Valgus', unit: '°', weight: 40 },
      ankleAlignment: { threshold: 20, moderate: 12, label: 'Ankle Deviation', unit: '°', weight: 20 },
      landingForce: { threshold: 4.5, moderate: 3.5, label: 'Impact Force', unit: 'x BW', weight: 30 },
      asymmetry: { threshold: 15, moderate: 10, label: 'Landing Asymmetry', unit: '%', inverse: true, weight: 25 }
    }
  },
  lunge: {
    name: 'Lunge',
    icon: '🤸‍♀️',
    metrics: ['kneeAlignment', 'hipDrop', 'trunkLean', 'stability'],
    riskFactors: {
      kneeAlignment: { threshold: 10, moderate: 5, label: 'Knee Tracking Error', unit: '°', weight: 30 },
      hipDrop: { threshold: 15, moderate: 8, label: 'Hip Drop Angle', unit: '°', weight: 25 },
      trunkLean: { threshold: 25, moderate: 15, label: 'Trunk Lateral Lean', unit: '°', weight: 20 },
      stability: { threshold: 85, moderate: 90, label: 'Dynamic Stability', unit: '%', inverse: true, weight: 25 }
    }
  },
  overhead: {
    name: 'Overhead Press',
    icon: '🏋️‍♂️',
    metrics: ['shoulderMobility', 'spinalExtension', 'armSymmetry', 'coreStability'],
    riskFactors: {
      shoulderMobility: { threshold: 160, moderate: 170, label: 'Shoulder Flexion', unit: '°', inverse: true, weight: 30 },
      spinalExtension: { threshold: 25, moderate: 15, label: 'Excessive Spine Extension', unit: '°', weight: 25 },
      armSymmetry: { threshold: 85, moderate: 90, label: 'Arm Symmetry', unit: '%', inverse: true, weight: 20 },
      coreStability: { threshold: 75, moderate: 85, label: 'Core Stability', unit: '%', inverse: true, weight: 25 }
    }
  },
  deadlift: {
    name: 'Deadlift',
    icon: '💪',
    metrics: ['spinalNeutral', 'kneeTracking', 'hipHinge', 'barPath'],
    riskFactors: {
      spinalNeutral: { threshold: 15, moderate: 8, label: 'Spine Deviation', unit: '°', weight: 40 },
      kneeTracking: { threshold: 8, moderate: 4, label: 'Knee Valgus', unit: '°', weight: 20 },
      hipHinge: { threshold: 70, moderate: 80, label: 'Hip Hinge Quality', unit: '%', inverse: true, weight: 25 },
      barPath: { threshold: 5, moderate: 3, label: 'Bar Path Deviation', unit: 'cm', weight: 15 }
    }
  },
  running: {
    name: 'Running Gait',
    icon: '🏃‍♂️',
    metrics: ['overstride', 'cadence', 'verticalOscillation', 'footStrike'],
    riskFactors: {
      overstride: { threshold: 15, moderate: 10, label: 'Overstride Distance', unit: 'cm', weight: 30 },
      cadence: { threshold: 160, moderate: 170, label: 'Step Cadence', unit: 'spm', inverse: true, weight: 25 },
      verticalOscillation: { threshold: 12, moderate: 9, label: 'Vertical Bounce', unit: 'cm', weight: 20 },
      footStrike: { threshold: 20, moderate: 10, label: 'Heel Strike Angle', unit: '°', weight: 25 }
    }
  }
};

const RISK_MESSAGES = {
  squat: {
    kneeValgus: { high: 'High ACL injury risk!', moderate: 'Monitor knee tracking' },
    forwardLean: { high: 'Spinal injury risk', moderate: 'Maintain upright posture' },
    depth: { high: 'Imbalanced loading pattern', moderate: 'Increase range of motion' },
    symmetry: { high: 'Severe movement asymmetry', moderate: 'Minor asymmetry detected' }
  },
  jump: {
    kneeValgus: { high: 'Critical landing mechanics - ACL risk!', moderate: 'Improve landing control' },
    ankleAlignment: { high: 'Ankle instability detected', moderate: 'Monitor ankle position' },
    landingForce: { high: 'Excessive impact forces', moderate: 'Hard landing detected' },
    asymmetry: { high: 'Uneven landing pattern', moderate: 'Slight landing asymmetry' }
  },
  lunge: {
    kneeAlignment: { high: 'Severe knee tracking error - injury risk!', moderate: 'Monitor knee alignment' },
    hipDrop: { high: 'Excessive hip drop - instability detected', moderate: 'Minor hip imbalance' },
    trunkLean: { high: 'Severe trunk lean - core weakness', moderate: 'Slight lateral lean detected' },
    stability: { high: 'Poor dynamic stability', moderate: 'Stability needs improvement' }
  },
  overhead: {
    shoulderMobility: { high: 'Limited shoulder range - injury risk', moderate: 'Shoulder mobility restricted' },
    spinalExtension: { high: 'Excessive spine arch - back strain risk', moderate: 'Monitor spinal position' },
    armSymmetry: { high: 'Severe arm asymmetry detected', moderate: 'Minor asymmetry in arms' },
    coreStability: { high: 'Poor core stability - compensation risk', moderate: 'Core stability needs work' }
  },
  deadlift: {
    spinalNeutral: { high: 'Spine deviation - serious injury risk!', moderate: 'Monitor spine alignment' },
    kneeTracking: { high: 'Knee valgus during lift', moderate: 'Minor knee tracking issue' },
    hipHinge: { high: 'Poor hip hinge pattern', moderate: 'Hip hinge needs improvement' },
    barPath: { high: 'Inefficient bar path', moderate: 'Minor bar path deviation' }
  },
  running: {
    overstride: { high: 'Severe overstriding - injury risk!', moderate: 'Slight overstriding detected' },
    cadence: { high: 'Very low cadence - inefficient gait', moderate: 'Cadence below optimal' },
    verticalOscillation: { high: 'Excessive vertical bounce', moderate: 'Increased vertical movement' },
    footStrike: { high: 'Heavy heel striking', moderate: 'Monitor foot strike pattern' }
  }
};

const RECOMMENDATIONS = {
  squat: {
    kneeValgus: { high: 'Strengthen glutes, practice external rotation cues', moderate: 'Focus on "knees out" cue' },
    forwardLean: { high: 'Improve ankle mobility, strengthen core', moderate: 'Keep chest up, work on thoracic mobility' },
    depth: { high: 'Improve hip and ankle flexibility', moderate: 'Gradually increase range of motion' },
    symmetry: { high: 'Address unilateral weaknesses', moderate: 'Single-leg strengthening exercises' }
  },
  jump: {
    kneeValgus: { high: 'Land softly, strengthen glutes and hips', moderate: 'Practice controlled landings' },
    ankleAlignment: { high: 'Improve ankle stability exercises', moderate: 'Focus on ankle positioning' },
    landingForce: { high: 'Practice soft landings, increase eccentric strength', moderate: 'Land with bent knees' },
    asymmetry: { high: 'Address bilateral imbalances', moderate: 'Practice symmetric landings' }
  },
  lunge: {
    kneeAlignment: { high: 'Strengthen hip abductors, practice proper tracking', moderate: 'Keep knee over toe' },
    hipDrop: { high: 'Strengthen glutes and core, practice level hips', moderate: 'Focus on hip stability' },
    trunkLean: { high: 'Strengthen core, improve lateral stability', moderate: 'Maintain upright posture' },
    stability: { high: 'Practice single-leg balance exercises', moderate: 'Work on dynamic stability' }
  },
  overhead: {
    shoulderMobility: { high: 'Improve shoulder flexibility, thoracic spine mobility', moderate: 'Stretch shoulders regularly' },
    spinalExtension: { high: 'Strengthen core, practice neutral spine', moderate: 'Avoid excessive back arch' },
    armSymmetry: { high: 'Address muscle imbalances, unilateral training', moderate: 'Focus on even arm movement' },
    coreStability: { high: 'Strengthen deep core muscles', moderate: 'Engage core during press' }
  },
  deadlift: {
    spinalNeutral: { high: 'Master hip hinge, strengthen core and glutes', moderate: 'Maintain neutral spine' },
    kneeTracking: { high: 'Strengthen glutes, improve hip mobility', moderate: 'Keep knees aligned' },
    hipHinge: { high: 'Practice hip hinge pattern, improve mobility', moderate: 'Lead with hips' },
    barPath: { high: 'Practice proper bar path, improve technique', moderate: 'Keep bar close to body' }
  },
  running: {
    overstride: { high: 'Increase cadence, practice midfoot striking', moderate: 'Shorten stride length' },
    cadence: { high: 'Focus on quicker steps, use metronome training', moderate: 'Gradually increase step rate' },
    verticalOscillation: { high: 'Focus on forward motion, reduce bounce', moderate: 'Run more efficiently forward' },
    footStrike: { high: 'Practice midfoot landing, gradual transition', moderate: 'Land under center of mass' }
  }
};

// Demo video presets for presentation
const DEMO_VIDEOS = {
  perfectSquat: {
    url: 'https://www.youtube.com/embed/YaXPRqUwItQ', // Perfect squat form
    title: 'Perfect Squat Form - Low Risk',
    riskProfile: 'low' // This will show excellent form with low risk
  },
  poorSquat: {
    url: 'https://www.youtube.com/embed/C_VtOYc6j5c', // Common squat mistakes
    title: 'Poor Squat Form - High Risk',
    riskProfile: 'high' // This will show poor form with high risk
  },
  jumpLanding: {
    url: 'https://www.youtube.com/shorts/-5LhNSMBrEs', // Your original video
    title: 'Jump Landing Analysis',
    riskProfile: 'moderate'
  }
};

// Utility functions (same as live camera)
const generateMetricValue = (metric, factor, riskProfile) => {
  // Generate values based on the selected risk profile for demonstration
  if (riskProfile === 'high') {
    // Generate high-risk values
    if (factor.inverse) {
      return Math.random() * 20 + 60; // Lower values for inverse metrics
    } else {
      return Math.random() * 20 + factor.threshold; // Higher values for normal metrics
    }
  } else if (riskProfile === 'low') {
    // Generate low-risk values
    if (factor.inverse) {
      return Math.random() * 10 + 90; // Higher values for inverse metrics
    } else {
      return Math.random() * 5; // Lower values for normal metrics
    }
  } else {
    // Moderate risk (existing logic)
    if (factor.inverse) {
      return Math.random() * 40 + 60;
    } else {
      if (metric === 'landingForce') {
        return Math.random() * 3 + 2;
      } else if (metric === 'cadence') {
        return Math.random() * 40 + 150;
      } else if (metric === 'shoulderMobility') {
        return Math.random() * 50 + 140;
      } else {
        return Math.random() * 30;
      }
    }
  }
};

const calculateRiskLevel = (riskPercentage) => {
  if (riskPercentage > 50) return 'high';
  if (riskPercentage > 25) return 'moderate';
  if (riskPercentage > 0) return 'low';
  return 'safe';
};

const getRiskStyles = (level) => {
  const styles = {
    high: 'bg-red-100 border-red-500 text-red-800',
    moderate: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    low: 'bg-green-100 border-green-500 text-green-800',
    safe: 'bg-gray-100 border-gray-300 text-gray-600'
  };
  return styles[level];
};

const getRiskIcon = (level) => {
  const icons = {
    high: <AlertTriangle className="w-6 h-6 text-red-600" />,
    moderate: <Activity className="w-6 h-6 text-yellow-600" />,
    low: <CheckCircle className="w-6 h-6 text-green-600" />,
    safe: <BarChart3 className="w-6 h-6 text-gray-400" />
  };
  return icons[level];
};

const getRiskTitle = (level) => {
  const titles = {
    high: 'High Risk',
    moderate: 'Moderate Risk',
    low: 'Low Risk',
    safe: 'Ready to Analyze'
  };
  return titles[level];
};

const VideoAnalysis = () => {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentExercise, setCurrentExercise] = useState('squat');
  const [videoUrl, setVideoUrl] = useState(DEMO_VIDEOS.perfectSquat.url);
  const [currentDemo, setCurrentDemo] = useState('perfectSquat');
  const [keyMetrics, setKeyMetrics] = useState({});
  const [riskLevel, setRiskLevel] = useState('safe');
  const [riskPercentage, setRiskPercentage] = useState(0);
  const [feedback, setFeedback] = useState([]);

  // Analysis function (same as live camera but with risk profile consideration)
  const analyzeMovement = useCallback(() => {
    if (!isAnalyzing) return;

    const exerciseConfig = EXERCISE_CONFIG[currentExercise];
    const newMetrics = {};
    const currentRiskProfile = DEMO_VIDEOS[currentDemo]?.riskProfile || 'moderate';

    // Generate realistic biomechanical data based on the demo video's risk profile
    Object.keys(exerciseConfig.riskFactors).forEach(metric => {
      const factor = exerciseConfig.riskFactors[metric];
      newMetrics[metric] = generateMetricValue(metric, factor, currentRiskProfile);
    });

    setKeyMetrics(newMetrics);

    // Calculate risk
    let totalRisk = 0;
    const newFeedback = [];

    Object.entries(newMetrics).forEach(([metric, value]) => {
      const factor = exerciseConfig.riskFactors[metric];
      const isHigh = factor.inverse ?
        value < factor.threshold : value > factor.threshold;
      const isModerate = factor.inverse ?
        value < factor.moderate && value >= factor.threshold :
        value > factor.moderate && value <= factor.threshold;

      if (isHigh) {
        totalRisk += factor.weight;
        newFeedback.push({
          type: 'danger',
          message: `${factor.label}: ${value.toFixed(1)}${factor.unit} - ${RISK_MESSAGES[currentExercise]?.[metric]?.high || 'High risk detected'}`,
          recommendation: RECOMMENDATIONS[currentExercise]?.[metric]?.high || 'Consult a movement professional'
        });
      } else if (isModerate) {
        totalRisk += factor.weight / 2;
        newFeedback.push({
          type: 'warning',
          message: `${factor.label}: ${value.toFixed(1)}${factor.unit} - ${RISK_MESSAGES[currentExercise]?.[metric]?.moderate || 'Monitor this metric'}`,
          recommendation: RECOMMENDATIONS[currentExercise]?.[metric]?.moderate || 'Work on improvement'
        });
      }
    });

    if (totalRisk < 10) {
      newFeedback.push({
        type: 'success',
        message: `✅ Excellent ${exerciseConfig.name.toLowerCase()} technique detected!`,
        recommendation: 'Continue with this optimal movement pattern. Consider progressive overload.'
      });
    } else if (totalRisk >= 10 && totalRisk < 25) {
      newFeedback.push({
        type: 'info',
        message: `ℹ️ Good ${exerciseConfig.name.toLowerCase()} form with minor areas for improvement`,
        recommendation: 'Focus on the highlighted metrics to optimize your technique.'
      });
    }

    const calculatedRisk = Math.min(totalRisk, 95);
    setRiskPercentage(calculatedRisk);
    setRiskLevel(calculateRiskLevel(calculatedRisk));
    setFeedback(newFeedback);

    setTimeout(analyzeMovement, 100);
  }, [isAnalyzing, currentExercise, currentDemo]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    analyzeMovement();
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    setRiskLevel('safe');
    setRiskPercentage(0);
    setFeedback([]);
    setKeyMetrics({});
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setCurrentDemo('custom');
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    }
  };

  const handleYouTubeUrl = (url) => {
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtube.com/shorts/')) {
      const videoId = url.split('shorts/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    setVideoUrl(embedUrl);
    setCurrentDemo('custom');
  };

  const selectDemoVideo = (demoKey) => {
    const demo = DEMO_VIDEOS[demoKey];
    setVideoUrl(demo.url);
    setCurrentDemo(demoKey);
    stopAnalysis(); // Reset analysis when changing videos
  };

  // Initialize metrics when exercise changes
  useEffect(() => {
    if (!isAnalyzing) {
      const exerciseConfig = EXERCISE_CONFIG[currentExercise];
      const initialMetrics = {};
      Object.keys(exerciseConfig.riskFactors).forEach(metric => {
        initialMetrics[metric] = 0;
      });
      setKeyMetrics(initialMetrics);
    }
  }, [currentExercise, isAnalyzing]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎥 Video Analysis Mode
          </h1>
          <p className="text-xl text-gray-600">
            Analyze movement patterns from videos or YouTube links
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Input Panel */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Video Input</h2>
              <select
                value={currentExercise}
                onChange={(e) => setCurrentExercise(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.entries(EXERCISE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Demo Video Presets */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo Videos (Perfect for Presentations)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(DEMO_VIDEOS).map(([key, demo]) => (
                  <button
                    key={key}
                    onClick={() => selectDemoVideo(key)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      currentDemo === key
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{demo.title}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        demo.riskProfile === 'high' ? 'bg-red-100 text-red-800' :
                        demo.riskProfile === 'low' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {demo.riskProfile} risk
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* YouTube URL Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom YouTube URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleYouTubeUrl(e.target.value);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="youtube"]');
                    if (input?.value) handleYouTubeUrl(input.value);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Load
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Upload Video File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Choose Video File
              </button>
            </div>

            {/* Video Display */}
            <div className="relative bg-black rounded-lg mb-6 overflow-hidden">
              {videoUrl.includes('youtube.com') ? (
                <iframe
                  src={videoUrl}
                  className="w-full h-64"
                  allowFullScreen
                  title="YouTube Video"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-64 object-cover"
                  controls
                />
              )}

              {!isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                  <div className="text-center text-white">
                    <Play className="w-12 h-12 mx-auto mb-4" />
                    <p>Click "Start Analysis" to begin</p>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute top-4 left-4">
                  <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>ANALYZING</span>
                  </div>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-4">
              {!isAnalyzing ? (
                <button
                  onClick={startAnalysis}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Start Analysis
                </button>
              ) : (
                <button
                  onClick={stopAnalysis}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Stop Analysis
                </button>
              )}
            </div>
          </section>

          {/* Analysis Results Panel */}
          <aside className="space-y-6">
            {/* Risk Display */}
            <div className={`p-6 rounded-xl border-2 ${getRiskStyles(riskLevel)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getRiskIcon(riskLevel)}
                  <h3 className="text-xl font-bold">{getRiskTitle(riskLevel)}</h3>
                </div>
                <div className="text-3xl font-bold">{riskPercentage}%</div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    riskPercentage > 50 ? 'bg-red-500' :
                    riskPercentage > 25 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${riskPercentage}%` }}
                />
              </div>
            </div>

            {/* Metrics Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {EXERCISE_CONFIG[currentExercise].name} Metrics
              </h3>

              <div className="space-y-4">
                {Object.entries(keyMetrics).map(([metric, value]) => {
                  const factor = EXERCISE_CONFIG[currentExercise].riskFactors[metric];
                  if (!factor) return null;

                  const isHigh = factor.inverse ?
                    value < factor.threshold : value > factor.threshold;
                  const isModerate = factor.inverse ?
                    value < factor.moderate && value >= factor.threshold :
                    value > factor.moderate && value <= factor.threshold;

                  return (
                    <div key={metric} className="flex justify-between items-center">
                      <span className="text-gray-600">{factor.label}</span>
                      <span className={`font-bold ${
                        isHigh ? 'text-red-600' : isModerate ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {value.toFixed(1)}{factor.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Real-time Feedback</h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {feedback.length === 0 ? (
                  <p className="text-gray-500 italic">Start analysis to receive feedback...</p>
                ) : (
                  feedback.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        item.type === 'danger' ? 'bg-red-50 border-red-500' :
                        item.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        item.type === 'info' ? 'bg-blue-50 border-blue-500' :
                        'bg-green-50 border-green-500'
                      }`}
                    >
                      <p className={`font-semibold ${
                        item.type === 'danger' ? 'text-red-800' :
                        item.type === 'warning' ? 'text-yellow-800' :
                        item.type === 'info' ? 'text-blue-800' :
                        'text-green-800'
                      }`}>
                        {item.message}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        💡 {item.recommendation}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysis;