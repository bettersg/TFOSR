import PropTypes from 'prop-types'
import styles from './cam.module.css'
import { useEffect, useRef, useState } from 'react'
import 'font-awesome/css/font-awesome.min.css';

export default function Cam({evaluateSign}) {
    const [camColor, setCamColor] = useState('black')
    const [feedbackMsg, setFeedbackMsg] = useState('')
    const [showHint, setShowHint] = useState(false);
    // const [camEnabled, setCamEnabled] = useState(false)
    let timeoutId;
    let hintTimeoutId;
    
    // useEffect(() => {
    //     navigator.permissions.query( { name: 'camera' } ).then((cameraPermissions) => {
    //         console.log(cameraPermissions)
    //         cameraPermissions.onchange = () => {
    //             console.log('permissions changed')
    //             if (!navigator.mediaDevices?.enumerateDevices) {
    //                 console.log("enumerateDevices() not supported.");
    //             } else {
    //             navigator.mediaDevices
    //                 .enumerateDevices()
    //                 .then((devices) => {
    //                     for (let device of devices) {
    //                         if (device.kind == 'videoinput') {
    //                             setCamEnabled(true)
    //                             console.log('detected', camEnabled)
    //                             return
    //                         }
    //                     }
    //                     setCamEnabled(false)
    //                     return
    //                 })
    //                 .catch((err) => {
    //                     console.error(`${err.name}: ${err.message}`);
    //                 });
    //             }
    //         }
    //     });
        
    // })
    

    const videoRef = useRef()
    // const videoConstraints = {
    //     video: {
    //         width: { min: 1024, ideal: 1280, max: 1920 },
    //         height: { min: 576, ideal: 720, max: 1080 },
    //     }
    // }

    // useEffect(() => {
    //     linkCam()

    //     // detect device permissions change and update camEnabled state
    //     navigator.permissions.query( { name: 'camera' } ).then((cameraPermissions) => {
    //         console.log(cameraPermissions)
    //         cameraPermissions.onchange = () => {
    //             console.log('permissions changed')
    //             if (!navigator.mediaDevices?.enumerateDevices) {
    //                 console.log("enumerateDevices() not supported.");
    //             } else {
    //             navigator.mediaDevices
    //                 .enumerateDevices()
    //                 .then((devices) => {
    //                     for (let device of devices) {
    //                         if (device.kind == 'videoinput') {
    //                             setCamEnabled(true)
    //                             linkCam()
    //                             console.log('detected', camEnabled)
    //                             return
    //                         }
    //                     }
    //                     setCamEnabled(false)
    //                     return
    //                 })
    //                 .catch((err) => {
    //                     console.error(`${err.name}: ${err.message}`);
    //                 });
    //             }
    //         }
    //     });
    // })

    // get webcam feed and link it to HTML video element
    // const linkCam = () => {
    //     navigator.mediaDevices
    //     .getUserMedia(videoConstraints)
    //     .then((stream) =>{
    //         console.log(stream)
    //         const video = videoRef.current
    //         video.srcObject = stream
    //         video.onloadedmetadata = () => {
    //             video.play()
    //         }
    //     }).catch((err) => {
    //         console.log(`${err.name}: ${err.message}`)
    //     })
    // }

    // const enableCamProps = {
    //     desc: 'To play the game, enable camera access.',
    //     enableHandler: () => {
    //         setCamMode('detect')
    //         beginHandler()
    //     },
    //     denyHandler: () => navigate('/'),
    // }
    
    const  handleEvaluate = (correct) => {
        evaluateSign(correct)
        sendFeedback(correct)

        if (correct) {
            setShowHint(false);
            startHintTimer(); 
        }
    }

    const sendFeedback = (correct) => {
        setCamColor(correct ? 'green' : 'red')
        setFeedbackMsg(correct ? 'Awesome!': 'Oops...  try again!')
        clearTimeout(timeoutId);
        console.log(timeoutId + 'cleared')

        timeoutId = setTimeout(() => {
            setCamColor('black');
            setFeedbackMsg('');
        }, 5000)
        console.log(timeoutId + 'created')
    };

    const startHintTimer = () => {
        if (hintTimeoutId) {
            clearTimeout(hintTimeoutId);
        }

        hintTimeoutId = setTimeout(() => {
            setShowHint(true);
            console.log('Hint button should now be visible.');
        }, 5000);
    };

    useEffect(() => {
        startHintTimer();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            if (hintTimeoutId) {
                clearTimeout(hintTimeoutId);
            }
        };
    }, []);

    return (
    <div className={styles.cam} style={{borderColor: camColor}}>
        <video muted width="1024" height='576' ref={videoRef}></video>
        {/* {!camEnabled &&  
        <div className={styles.enableCamMsg}>
            To play the game, enable camera access.
        </div>} */}
        {<div className={styles.feedbackContainer}>
            <div className={styles.feedback} style={{borderColor: camColor}}>{feedbackMsg}</div>
            <div className={styles.btnContainer}>
                <button className='button' onClick={() => handleEvaluate(true)}>Correct sign</button>
                <button className='button' onClick={() => handleEvaluate(false)}>Wrong sign</button>
            </div>
            {showHint && ( <button className={styles.hintBtn} onClick={() => alert('This is a hint!')}>
                <i className="fa fa-lightbulb-o"></i> Hint! </button>
            )}
        </div>}
    </div>
    )
}

Cam.propTypes = {
    evaluateSign: PropTypes.func.isRequired,
    // camEnabled: PropTypes.bool.isRequired
}