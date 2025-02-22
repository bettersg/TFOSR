import PropTypes from 'prop-types'
import styles from './cam.module.css'
import { useCallback, useRef, useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import { FaLightbulb } from "react-icons/fa"; 
import axios from 'axios';
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import hand_landmarker_task from "../models/hand_landmarker.task";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";


export default function Cam({ capturing, setCapturing, setDetectedLetter, correct, hint, hintButtonHandler, useML=true }) {
    // Timer and interval states
    const [intervalId, setIntervalId] = useState(null);
    const [showWebcam, setShowWebcam] = useState(true); // New state to control webcam visibility
    const [imageSrc, setImageSrc] = useState(null); // State to hold the image source

    // Webcam reference and video constraints
    const webcamRef = useRef();
    const frameBufferRef = useRef([]); // Buffer to store frames

    const videoConstraints = {
        facingMode: 'user',
        width: 640,
        height: 480
    };

    const handleWebcamMount = () => {
        handleStartCapture();
    }

    const handleStartCapture = useCallback(async () => {
        const video = webcamRef.current.video;
        const stream = webcamRef.current.stream;

        // Load model
        let handLandmarker;
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );
        handLandmarker = await HandLandmarker.createFromOptions(
            vision, {
                baseOptions: { modelAssetPath: hand_landmarker_task },
                numHands: 2,
                runningMode: "video"
            }
        );

        console.log("Hand Landmarker model loaded");
        const HAND_CONNECTIONS = [
            [0, 1], [1, 2], [2, 3], [3, 4],  // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],  // Index
            [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
            [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
            [0, 17], [17, 18], [18, 19], [19, 20]  // Pinky
        ];

        const interval = setInterval(async () => {
            if (stream.active && video.readyState >= 2) {
                // Always capture the current frame from the video stream
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);


                // Detect landmarks regardless of whether they are present
                const detections = handLandmarker.detectForVideo(video, performance.now());
                console.log("Detections:", detections);

                // Optionally, you can still draw keypoints if needed
                if (detections.landmarks.length > 0) {
                    // Draw the landmarks as light red circles
                    detections.landmarks.forEach((landmark) => {
                        landmark.forEach((point) => {
                            const [x, y] = [point["x"] * canvas.width, point["y"] * canvas.height];
                            console.log("x:", x, "y:", y);
                            ctx.beginPath();
                            ctx.arc(x, y, 5, 0, 2 * Math.PI); // Draw circle at each point
                            ctx.fillStyle = "orange"; // Light red color
                            ctx.fill();
                        });
                    });
        
                    // Draw the connections between the landmarks in light green
                    HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
                        const start = detections.landmarks[0][startIdx];
                        const end = detections.landmarks[0][endIdx];
                        if (start && end) {
                            const [x1, y1] = [start["x"] * canvas.width, start["y"] * canvas.height];
                            const [x2, y2] = [end["x"] * canvas.width, end["y"] * canvas.height];
                            ctx.beginPath();
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.strokeStyle = "lime"; // Light green color
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    });
                }

                // Update the image source with the canvas data
                setImageSrc(canvas.toDataURL("image/jpeg"));
            }
        }, 100); // Update every 100ms

        setIntervalId(interval);
        setShowWebcam(false); // Hide the webcam when starting capture
    }, [webcamRef]);

    const sendFrames = async (frames) => {
        const formData = new FormData();
        frames.forEach((blob, i) => {
            formData.append("files", blob, `frame_${i}.jpg`);
        });

        try {
            const response = await axios.post("https://tfosr-ml.onrender.com/predict", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Server Response:", response.data);
            const modelResponse = response.data;
            var majorityLetter = modelResponse["majority_letter"];

            if (majorityLetter === null) {
                return null;
            } else { 
                setDetectedLetter(majorityLetter);
                return null;
            }
        } catch (error) {
            console.error("Error sending batch:", error.response?.data || error.message);
        }
    };

    const handleStopCapture = useCallback(() => {
        setCapturing(false);
        clearInterval(intervalId);
        setIntervalId(null);
    }, [webcamRef, setCapturing]);

    return (
        <div className={styles.cam} style={{ borderColor: correct ? `var(--color-${correct == "correct" ? "correct": "wrong"})` : 'white' }}>

            <Webcam
                videoConstraints={videoConstraints}
                ref={webcamRef}
                onUserMedia={handleWebcamMount}
                style={{
                borderRadius: "20px",
                position: "relative",
                top: 0,
                left: 0,
                zIndex: -1,
                width: "0%",
                height: "0%"
                }}
            />

            <div className={styles.feedbackContainer}>
            {imageSrc && (
                    <img
                        src={imageSrc}
                        alt="Landmarks"
                        style={{
                            borderRadius: "20px",
                            objectFit: "cover",
                            zIndex: 1000,
                            position: "relative",
                            top: 0,
                            left: 0
                        }}
                        />
                    )}
                {correct && <div
                    className={styles.feedback}
                    style={{
                        borderColor: correct ? `var(--color-${correct == "correct" ? "correct": "wrong"})` : 'black' }}
                >
                    {correct == "correct" ? 'Awesome, you got it!' : 'Not quite!'}
                </div>}
                {hint && hint == 'button' && <button className={styles.hintBtn} onClick={hintButtonHandler}>
                    <FaLightbulb />Hint!</button>
                }
            </div>
        </div>
    );
}

Cam.propTypes = {
    capturing: PropTypes.bool.isRequired,
    setCapturing: PropTypes.func,
    setDetectedLetter: PropTypes.func,
    correct: PropTypes.string,
    hint: PropTypes.string,
    hintButtonHandler: PropTypes.func,
    useML: PropTypes.bool,
};
