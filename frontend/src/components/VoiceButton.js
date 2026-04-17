import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

export default function VoiceButton({ onTranscript }) {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    // Use browser/OS language for true multilingual support
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }, [isListening, onTranscript]);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleListening}
      className={`p-2.5 rounded-xl transition-all ${
        isListening ? "bg-red-500 text-white" : "bg-muted text-gray-400 hover:text-white"
      }`}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </motion.button>
  );
}
