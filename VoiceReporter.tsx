import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Play, CheckCircle, Sparkles, AlertCircle, Info, RefreshCw } from "lucide-react";

interface VoiceReporterProps {
  onParsedResult: (parsed: {
    title: string;
    category: string;
    description: string;
    urgency: "Low" | "Medium" | "High" | "Critical";
    department: string;
  }) => void;
  onTranscriptChange: (text: string) => void;
}

export default function VoiceReporter({ onParsedResult, onTranscriptChange }: VoiceReporterProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioWaves, setAudioWaves] = useState<number[]>([10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recognitionObj, setRecognitionObj] = useState<any>(null);
  const waveTimer = useRef<NodeJS.Timeout | null>(null);

  // Pre-configured typical voice report templates for easy testing
  const mockVoiceSnippets = [
    {
      label: "📢 Garbage Clog",
      text: "There is a massive pile of wet garbage bags dumped right next to the school gate. It is smelling horrible and street dogs are scattering it all over the main road."
    },
    {
      label: "🕳️ Broken Pothole",
      text: "I am near the Gachibowli DLF junction. There is a huge and very dangerous open pothole right in the middle of the left lane. Scooters are swerving to avoid it and it might cause a major crash."
    },
    {
      label: "💡 Dark Street",
      text: "All five street lights are completely broken and pitch black on block C stretch near the Jubilee Hills station. It is very scary and unsafe for elderly residents who walk here in the evenings."
    },
    {
      label: "💧 Sewer Spillage",
      text: "A sewer line has burst on Road Number 36. Black sewage water is flooding the entrance of our gated community. It is extremely unhygienic and needs immediate cleaning."
    }
  ];

  // Try to initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-IN"; // Set to Indian English for better accent recognition

      rec.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      rec.onresult = (event: any) => {
        const resultIndex = event.resultIndex;
        const speechResult = event.results[resultIndex][0].transcript;
        setTranscript((prev) => {
          const updated = prev ? prev + " " + speechResult : speechResult;
          onTranscriptChange(updated);
          return updated;
        });
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        if (event.error === "not-allowed") {
          setError("Microphone permissions denied. Please try speaking using our simulated voice assistant panel below.");
        } else {
          setError(`Speech capture error: ${event.error}.`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognitionObj(rec);
    }
  }, []);

  // Audio wave animation
  useEffect(() => {
    if (isListening) {
      waveTimer.current = setInterval(() => {
        setAudioWaves(Array.from({ length: 15 }, () => Math.floor(Math.random() * 45) + 5));
      }, 100);
    } else {
      if (waveTimer.current) {
        clearInterval(waveTimer.current);
      }
      setAudioWaves(Array.from({ length: 15 }, () => 10));
    }
    return () => {
      if (waveTimer.current) clearInterval(waveTimer.current);
    };
  }, [isListening]);

  const toggleListen = () => {
    if (!recognitionObj) {
      setError("Web Speech API is not supported in this browser. Please use our instant simulated voice assistant below.");
      return;
    }

    if (isListening) {
      recognitionObj.stop();
    } else {
      setError(null);
      setSuccess(false);
      try {
        recognitionObj.start();
      } catch (err) {
        console.error("Failed starting speech recognition", err);
        recognitionObj.stop();
      }
    }
  };

  // Process voice text using Gemini (or fallback mock)
  const processVoiceText = async (textToParse: string) => {
    if (!textToParse || textToParse.trim() === "") return;
    
    setParsing(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/parse-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToParse }),
      });

      if (!res.ok) {
        throw new Error("Server failed to parse transcript");
      }

      const data = await res.json();
      onParsedResult(data);
      setSuccess(true);
    } catch (err: any) {
      setError("Failed to parse voice via AI. Please enter manually or try again.");
    } finally {
      setParsing(false);
    }
  };

  const handleSimulateVoice = (sampleText: string) => {
    setError(null);
    setSuccess(false);
    setTranscript(sampleText);
    onTranscriptChange(sampleText);

    // Animate speech waves briefly to simulate speaking
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      processVoiceText(sampleText);
    }, 1500);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-all" id="voice-reporter-module">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Mic className="w-4 h-4 text-blue-600" />
          AI Voice Assistant Reporter
        </label>
        {recognitionObj && (
          <span className="text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
            Active Listen Enabled
          </span>
        )}
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-lg shadow-inner mb-4">
        {/* Wave visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-16 w-full mb-4" id="audio-visualizer-wave">
          {audioWaves.map((height, idx) => (
            <span
              key={idx}
              className={`w-1 rounded-full transition-all duration-100 ${
                isListening ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "bg-slate-300 dark:bg-slate-700"
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={toggleListen}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
            isListening
              ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          id="mic-activation-btn"
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-3 text-center">
          {isListening ? "Listening... Speak your complaint clearly now." : "Click microphone button to speak and record your report"}
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
            Real-time Voice Transcript Output
          </label>
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              onTranscriptChange(e.target.value);
            }}
            placeholder="Your voice transcription will populate here. Or, you can type inside this field to compose directly..."
            className="w-full h-24 p-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
            id="voice-transcript-text"
          />
        </div>

        {transcript && (
          <button
            type="button"
            onClick={() => processVoiceText(transcript)}
            disabled={parsing || transcript.trim() === ""}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 px-4 rounded-lg font-medium text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            id="process-transcript-btn"
          >
            {parsing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                AI Analyzing Voice & Categorizing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Trigger AI Municipal Classification
              </>
            )}
          </button>
        )}

        {error && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200/40 text-xs flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-200/40 text-xs flex gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <p>Gemini AI has successfully analyzed and pre-filled the Form Category, Description, Urgency, and Assigned Municipal Agency!</p>
          </div>
        )}

        {/* Mock/Simulated Voice Triggers */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
            <Info className="w-3 h-3 text-blue-600" />
            Or simulate speaking with our pre-recorded civic statements:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {mockVoiceSnippets.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSimulateVoice(item.text)}
                className="p-2 bg-slate-100 dark:bg-slate-850 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-left border border-slate-200 dark:border-slate-850 hover:border-blue-500 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 transition-all flex flex-col gap-1"
                id={`simulate-voice-btn-${idx}`}
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between w-full">
                  {item.label}
                  <Play className="w-2.5 h-2.5 text-blue-600" />
                </span>
                <span className="line-clamp-2 opacity-80 text-[10px] leading-relaxed">
                  "{item.text}"
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
