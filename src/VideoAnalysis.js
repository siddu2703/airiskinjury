import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Activity, BarChart3, Upload } from 'lucide-react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// Import the same exercise config and utilities from the main component
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
  }
};

const RISK_MESSAGES = {
  squat: {
    kneeValgus: { high: 'High ACL injury risk detected!', moderate: 'Monitor knee tracking' },
    forwardLean: { high: 'Spinal injury risk', moderate: 'Maintain upright posture' },
    depth: { high: 'Imbalanced loading pattern', moderate: 'Increase range of motion' },
    symmetry: { high: 'Severe movement asymmetry', moderate: 'Minor asymmetry detected' }
  },
  jump: {
    kneeValgus: { high: 'Critical landing mechanics - ACL risk!', moderate: 'Improve landing control' },
    ankleAlignment: { high: 'Ankle instability detected', moderate: 'Monitor ankle position' },
    landingForce: { high: 'Excessive impact forces', moderate: 'Hard landing detected' },
    asymmetry: { high: 'Uneven landing pattern', moderate: 'Slight landing asymmetry' }
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
  }
};

// Utility functions
const calculateAngle = (point1, point2, point3) => {
  const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
                  Math.atan2(point1.y - point2.y, point1.x - point2.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
};

const calculateDistance = (point1, point2) => {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

const analyzePose = (landmarks, exercise) => {
  if (!landmarks || landmarks.length < 33) return null;

  const results = {};

  // Key landmark indices for MediaPipe Pose
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  if (exercise === 'squat') {
    // Calculate knee valgus (knee angle)
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    results.kneeValgus = Math.abs(leftKneeAngle - rightKneeAngle);

    // Calculate forward lean (torso angle)
    const torsoAngle = calculateAngle(leftShoulder, leftHip, { x: leftHip.x, y: leftHip.y + 0.1 });
    results.forwardLean = Math.abs(torsoAngle - 90);

    // Calculate depth (hip-knee relation)
    const hipHeight = (leftHip.y + rightHip.y) / 2;
    const kneeHeight = (leftKnee.y + rightKnee.y) / 2;
    results.depth = Math.max(0, Math.min(100, ((hipHeight - kneeHeight) / hipHeight) * 100));

    // Calculate symmetry
    const leftLegLength = calculateDistance(leftHip, leftAnkle);
    const rightLegLength = calculateDistance(rightHip, rightAnkle);
    results.symmetry = Math.max(0, 100 - Math.abs(leftLegLength - rightLegLength) * 100);
  } else if (exercise === 'jump') {
    // Similar calculations for jump landing
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    results.kneeValgus = Math.abs(leftKneeAngle - rightKneeAngle);

    // Ankle alignment
    const leftAnkleAngle = calculateAngle(leftKnee, leftAnkle, { x: leftAnkle.x, y: leftAnkle.y + 0.1 });
    const rightAnkleAngle = calculateAngle(rightKnee, rightAnkle, { x: rightAnkle.x, y: rightAnkle.y + 0.1 });
    results.ankleAlignment = Math.abs(leftAnkleAngle - rightAnkleAngle);

    // Simulated landing force based on knee bend
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
    results.landingForce = Math.max(2, Math.min(6, 6 - (avgKneeAngle / 30)));

    // Landing asymmetry
    const leftFootPos = leftAnkle.x;
    const rightFootPos = rightAnkle.x;
    results.asymmetry = Math.max(0, 100 - Math.abs(leftFootPos - rightFootPos) * 200);
  }

  return results;
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

const VideoAnalysis = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const poseRef = useRef(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentExercise, setCurrentExercise] = useState('squat');
  const [videoUrl, setVideoUrl] = useState('');
  const [analysisResults, setAnalysisResults] = useState({});
  const [riskLevel, setRiskLevel] = useState('safe');
  const [riskPercentage, setRiskPercentage] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [poseResults, setPoseResults] = useState(null);

  // Initialize MediaPipe Pose
  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothSegmentation: true,
      enableSegmentation: false,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults((results) => {
      setPoseResults(results);
      if (results.poseLandmarks && isAnalyzing) {
        const metrics = analyzePose(results.poseLandmarks, currentExercise);
        if (metrics) {
          setAnalysisResults(metrics);
          calculateRisk(metrics);
        }
      }
      drawResults(results);
    });

    poseRef.current = pose;
  }, [isAnalyzing, currentExercise]);

  const drawResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, Pose.POSE_CONNECTIONS, {
        color: '#00FF00', lineWidth: 4
      });
      drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0000', lineWidth: 2, radius: 6
      });
    }
    ctx.restore();
  };

  const calculateRisk = useCallback((metrics) => {
    const exerciseConfig = EXERCISE_CONFIG[currentExercise];
    let totalRisk = 0;
    const newFeedback = [];

    Object.entries(metrics).forEach(([metric, value]) => {
      const factor = exerciseConfig.riskFactors[metric];
      if (!factor) return;

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

    const calculatedRisk = Math.min(totalRisk, 95);
    setRiskPercentage(calculatedRisk);
    setRiskLevel(calculateRiskLevel(calculatedRisk));
    setFeedback(newFeedback);
  }, [currentExercise]);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    }
  };

  const handleYouTubeUrl = (url) => {
    // Convert YouTube URL to embed format
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
  };

  const startAnalysis = async () => {
    if (!videoRef.current) return;

    setIsAnalyzing(true);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (poseRef.current && videoRef.current) {
          await poseRef.current.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480
    });

    camera.start();
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    setAnalysisResults({});
    setRiskLevel('safe');
    setRiskPercentage(0);
    setFeedback([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎥 Video Analysis Mode
          </h1>
          <p className="text-xl text-gray-600">
            Upload a video or paste YouTube URL for AI-powered movement analysis
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

            {/* YouTube URL Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL (Default: Your provided video)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://www.youtube.com/shorts/-5LhNSMBrEs"
                  defaultValue="https://www.youtube.com/shorts/-5LhNSMBrEs"
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

              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                width={640}
                height={480}
              />

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
                  disabled={!videoUrl}
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

          {/* Analysis Results */}
          <aside className="space-y-6">
            {/* Risk Display */}
            <div className={`p-6 rounded-xl border-2 ${getRiskStyles(riskLevel)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getRiskIcon(riskLevel)}
                  <h3 className="text-xl font-bold">{riskLevel === 'safe' ? 'Ready to Analyze' : `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk`}</h3>
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
                {EXERCISE_CONFIG[currentExercise]?.name} Metrics
              </h3>

              <div className="space-y-4">
                {Object.entries(analysisResults).map(([metric, value]) => {
                  const factor = EXERCISE_CONFIG[currentExercise]?.riskFactors[metric];
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
                        'bg-green-50 border-green-500'
                      }`}
                    >
                      <p className={`font-semibold ${
                        item.type === 'danger' ? 'text-red-800' :
                        item.type === 'warning' ? 'text-yellow-800' :
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