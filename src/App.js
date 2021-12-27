import logo from './logo.svg';
import './App.css';
import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore';
import ReactGauge from "react-gauge-capacity";
import ReactSpeedometer from "react-d3-speedometer"
import React, {useState} from "react";
import ReactPlayer from 'react-player'
// Your web app's Firebase configuration
let env = process.env;
const firebaseConfig = {
  apiKey: env.REACT_APP_API_KEY,
  authDomain: env.REACT_APP_AUTH_DOMAIN,
  projectId: "giku-camp-12",
  storageBucket: env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: env.REACT_APP_MESSAGING_SENDER_ID,
  appId: env.REACT_APP_APP_ID
};

// // Initialize Firebase
// const firebaseApp = initializeApp(firebaseConfig);
// const db = getFirestore(firebaseApp);
//
// const querySnapshot = await getDocs(collection(db, "users"));
// querySnapshot.forEach((doc) => {
//   console.log(`${doc.id} => ${doc.data()}`);
// });
// Firebaseを紐付け、初期化
const firebaseApp = initializeApp(firebaseConfig);

// Firestoreのインスタンス作成
const db = getFirestore(firebaseApp);
// const docRef = doc(firebaseStore, "params", "zEBzPIZPqvY8TKgW8HzM");

// const querySnapshot = await getDocs(collection(db, "users"));
// querySnapshot.forEach((doc) => {
//   console.log(`${doc.id} => ${doc.data()}`);
// });
let fields;
let flg = 0
let base = 0
let tp_len = 0
let diff_before = 0
let diff = 0
let count = 0
let paper_count = 0
let sum_length = 0
let video_flg = 0

function App() {

  // const unsub = onSnapshot(doc(db, "params", "zEBzPIZPqvY8TKgW8HzM"), (doc) => {
  //   fields = doc.data()
  //   console.log(fields);
  // });
    const [tp_length, settp_length] = useState()

    function Greeting(props) {
        if (props.number === 1) {
            return <div className='player-wrapper'>
                <ReactPlayer
                    className='react-player fixed-bottom'
                    url= 'videos/few.mp4'
                    width='20%'
                    height='20%'
                    controls = {true}
                    muted='true'
                    playing='true'
                />
            </div>;
        }else if (props.number === 2){
            return <div className='player-wrapper'>
                <ReactPlayer
                    className='react-player fixed-bottom'
                    url= 'videos/normal.mp4'
                    width='100%'
                    height='100%'
                    controls = {true}
                />
            </div>;
        }else if (props.number === 3){
            return <div className='player-wrapper'>
                <ReactPlayer
                    className='react-player fixed-bottom'
                    url= 'videos/more.mp4'
                    width='100%'
                    height='100%'
                    controls = {true}
                />
            </div>;
        }else {
            return <div/>
        }
    }

  // 副作用フック
    React.useEffect(() => {
      console.log('checking')
      const intervalId = setInterval(() => {
        fetch('http://192.168.180.1/angle')
            .then(res => res.json())
            .then(data => {
              tp_len = data.angle
              if(flg === 0){
                flg = 1;
                base = data.angle;
              paper_count += 1;
              }
              // console.log('diff')
              // console.log(tp_len - base)
                diff = tp_len - base
                if(((tp_len - base)/5000)*1.2 > 3 && Math.abs(diff - diff_before)<200){
                    count += 1;
                    if(count >= 5){
                        flg = 0
                        count = 0
                        sum_length += ((tp_len - base)/5000)*1.2;
                    }
                    if(((tp_len - base)/5000)*1.2 < 70 && video_flg !== 1){
                        console.log('jjj')
                        video_flg = 1
                    }else if(((tp_len - base)/5000)*1.2 > 90 && video_flg !== 1){
                        video_flg = 2
                    }else if(video_flg !== 1){
                        video_flg = 3;
                    }
                }
                settp_length(diff)
                diff_before = tp_len - base
            })


      }, 500);
      return () => {
        clearInterval(intervalId)
    };

  }, []);

  return (
    <div className="App">
      <div className="App-meter">
          <h1 className="sumlen">{sum_length.toFixed(1)}<span className="spann">cm</span></h1>
          <h2 className="sumlen2">{paper_count}回目のフキフキ</h2>
        <ReactSpeedometer value={((tp_len - base)/5000)*1.2} maxValue={180} segmentColors={[
            "#bf616a",
            "#d08770",
            "#72da60",
            "#d08770",
            "#bf616a",
        ]}/>
      </div>
        {/*<Greeting number={video_flg}/>*/}
    </div>
  );
}

export default App;
