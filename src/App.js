import React from "react";
import AgoraRTC from "agora-rtc-sdk";
import "./App.css"
var rtc = {
  client:null,
  joined:false,
  published:false,
  localStrean:null,
  remoteStreams:[],
  params:{}
}

var options = {
  appId:"6c02a49303124f98a93d290d51ecafc1",
  channel:"aiyush",
  uid:null,
  token:"0066c02a49303124f98a93d290d51ecafc1IACE/bvJZcv30sZOODvHl7xEmBF61yU+K3mKD4yQXHhHYpLuPuUAAAAAEADqgOQ9A5VEYAEAAQAClURg",
  secret:"5898d1f0441b4a7da3ff100cffe33b99"

}

function joinChannel(role){
  rtc.client = AgoraRTC.createClient({mode:"live",codec:"h264"});

  rtc.client.init(options.appId,function(){
    console.log("init success")

    rtc.client.join(options.token ? 
      options.token:null,
      options.channel,options.uid ? +options.uid:null,function(uid){
        console.log("join channel"+options.channel+"success, uid"+uid);
        rtc.params.uid = uid;
        if(role==="host"){
          rtc.client.setClientRole("host");

          rtc.localStrean = AgoraRTC.createStream({
            streamID:rtc.params.uid,
            audio:true,
            video:true,
            screen:false,
           })

           rtc.localStrean.init(function(){
             console.log("init local stream success");
             rtc.localStrean.play("local_stream");
             rtc.client.publish(rtc.localStrean,function(err){
               console.log("publish failed");
               console.log(err);
             })
           },function(err){
             console.log("init local stream failed",err)
           });
           rtc.client.on("connection-state-changed",function(evt){
             console.log("audience",evt)
           })
        }
        if(role==="audience"){
          rtc.client.on("connection-state-changed",function(evt){
            console.log("audience",evt)
          })
          rtc.client.on("stream-added",function(evt){
            var remoteStream = evt.stream;
            var id = remoteStream.getId();
            if(id!==rtc.params.uid){
              rtc.client.subscribe(remoteStream,function(err){
                console.log("stream failed",err)
              })
            }
            console.log("strean added",id)
          });

          rtc.client.on("stream-removed",function(evt){
            var remoteStream = evt.stream;
            var id = remoteStream.getId();
            console.log("stream removed",id)
          });
          rtc.client.on("stream-subscribed",function(evt){
            var remoteStream = evt.stream;
            var id = remoteStream.getId();
            remoteStream.play("remote_video_");
            console.log("stream subscribed",id);
           });
           rtc.client.on("stream-unsubscribed",function(evt){
            var remoteStream = evt.stream;
            var id = remoteStream.getId();
            remoteStream.play("remote_video_");
            console.log("stream unsubscribed",id);
           })
        }
      },function(err){
        console.log("client join falied",err)
      })
  },(err)=>{
    console.log(err)
  })
}

function leaveChannelHost(params){
  rtc.client.unpublish(rtc.localStrean,function(err){
    console.log("publish failed");
    console.log(err)
  })
  rtc.client.leave(function(ev){
    console.log(ev)
  })
}

function leaveChannelAud(params){
  rtc.client.leave(function(){
    console.log('clent leave channel');
  },function(err){
    console.log("client leave failed",err)
  })
}


function LiveVideoStreaming(props){
  return(
    <div>
      <button onClick={()=>joinChannel("host")}>Join Channel as host</button>
      <button onClick={()=>joinChannel("audience")}>Join Channel as audience</button>
      <button onClick={()=>leaveChannelHost("host")}>leave channel as host</button>
      <button onClick={()=>leaveChannelAud("audience")}>leave channel as audience</button>
      <div>
      <div id="local_stream"className="local_stream"style={{width:"400px",height:"400px"}}></div>
       <div className="remote" id="remote_video_" style={{width:"400px",height:"400px"}}/>
    </div>
    </div>
  )
}

export default LiveVideoStreaming;