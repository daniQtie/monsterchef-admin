"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, serverTimestamp } from "firebase/firestore";
import {
  ref as dbRef,
  onValue,
  set as dbSet,
  push,
  remove,
  onChildAdded,
  off,
} from "firebase/database";
import { db, rtdb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { AppUser } from "@/lib/types";

export default function LiveStreamPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  const { appUser } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [student, setStudent] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<"idle" | "requesting" | "connecting" | "streaming" | "ended" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRefPath = `streams/${studentId}`;

  useEffect(() => {
    const loadStudent = async () => {
      const snap = await getDoc(doc(db, "users", studentId));
      if (snap.exists()) setStudent({ uid: studentId, ...snap.data() } as AppUser);
    };
    loadStudent();
  }, [studentId]);

  const requestView = async () => {
    if (!appUser) return;
    setStatus("requesting");
    setErrorMsg("");

    // Clean previous session
    await remove(dbRef(rtdb, streamRefPath));

    // Create peer connection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        // Free TURN server fallback (for restrictive NATs)
        {
          urls: ["turn:openrelay.metered.ca:80", "turn:openrelay.metered.ca:443"],
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      console.log("[WebRTC] ontrack fired!", event.streams.length, "streams,", event.track.kind);
      if (!videoRef.current || !event.track) {
        console.warn("[WebRTC] No video element or no track");
        return;
      }
      // Unity adds track without an explicit MediaStream → wrap the track in a new stream
      const stream = event.streams[0] || new MediaStream([event.track]);
      videoRef.current.srcObject = stream;
      setStatus("streaming");
      console.log("[WebRTC] Video element source set, track:", event.track.id);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[WebRTC] ICE state:", pc.iceConnectionState);
    };

    pc.onicegatheringstatechange = () => {
      console.log("[WebRTC] ICE gathering:", pc.iceGatheringState);
    };

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        const iceRef = push(dbRef(rtdb, `${streamRefPath}/ice/teacher`));
        await dbSet(iceRef, {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        setStatus("ended");
      }
    };

    // Listen for student's offer
    const offerRef = dbRef(rtdb, `${streamRefPath}/offer`);
    onValue(offerRef, async (snap) => {
      if (!snap.exists()) return;
      const offer = snap.val();
      if (pc.remoteDescription) return; // already handled
      try {
        setStatus("connecting");
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await dbSet(dbRef(rtdb, `${streamRefPath}/answer`), {
          sdp: answer.sdp,
          type: "answer",
        });
      } catch (err) {
        console.error(err);
        setErrorMsg(`Connection failed: ${err}`);
        setStatus("error");
      }
    });

    // Listen for student ICE candidates
    const studentIceRef = dbRef(rtdb, `${streamRefPath}/ice/student`);
    onChildAdded(studentIceRef, async (snap) => {
      const data = snap.val();
      if (!data) return;
      // Skip if peer connection no longer open
      if (pc.signalingState === "closed") return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate({
          candidate: data.candidate,
          sdpMid: data.sdpMid,
          sdpMLineIndex: data.sdpMLineIndex,
        }));
      } catch (err) {
        // Silent — non-critical
        console.debug("ICE skipped:", err);
      }
    });

    // Send request signal to student
    await dbSet(dbRef(rtdb, `${streamRefPath}/request`), {
      teacherId: appUser.uid,
      timestamp: Date.now(),
    });
  };

  const endView = async () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    await remove(dbRef(rtdb, streamRefPath));
    setStatus("ended");
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (pcRef.current) pcRef.current.close();
      const offerRef = dbRef(rtdb, `${streamRefPath}/offer`);
      const studentIceRef = dbRef(rtdb, `${streamRefPath}/ice/student`);
      off(offerRef);
      off(studentIceRef);
      remove(dbRef(rtdb, streamRefPath));
    };
  }, [streamRefPath]);

  return (
    <div>
      <button
        onClick={() => router.push("/dashboard/live")}
        className="mb-4 text-sm text-neutral-400 hover:text-neutral-100"
      >
        ← Back to Live View
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {student?.displayName || "Loading..."}
          </h1>
          <p className="text-neutral-400 text-sm">
            {student?.sectionName} · {student?.email}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1.5 rounded-full ${
            status === "streaming"
              ? "bg-red-500/30 text-red-300 border border-red-500"
              : status === "connecting" || status === "requesting"
              ? "bg-amber-500/30 text-amber-300 border border-amber-500"
              : "bg-neutral-800 text-neutral-400"
          }`}
        >
          {status === "streaming" && "● LIVE"}
          {status === "connecting" && "Connecting..."}
          {status === "requesting" && "Waiting for student..."}
          {status === "idle" && "Idle"}
          {status === "ended" && "Ended"}
          {status === "error" && "Error"}
        </span>
      </div>

      <div className="bg-black rounded-2xl overflow-hidden border border-neutral-800 mb-4 aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain"
        />
        {status !== "streaming" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-6xl mb-3">📺</div>
              <p className="text-neutral-400 text-sm">
                {status === "idle" && "Click Request View to start streaming"}
                {status === "requesting" && "Waiting for student to accept..."}
                {status === "connecting" && "Establishing connection..."}
                {status === "ended" && "Stream ended"}
                {status === "error" && errorMsg}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {status === "idle" || status === "ended" || status === "error" ? (
          <button
            onClick={requestView}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-semibold rounded-lg"
          >
            📺 Request View
          </button>
        ) : (
          <button
            onClick={endView}
            className="px-6 py-3 bg-red-700 hover:bg-red-600 rounded-lg"
          >
            ⏹ End Stream
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-lg p-3">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
