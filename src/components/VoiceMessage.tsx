
import { useState } from "react";
import { Mic, MicOff, Play, Pause, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VoiceMessageProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

const VoiceMessage = ({ onSend, onCancel }: VoiceMessageProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    // Mock recording - in real app would use MediaRecorder API
    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    setTimeout(() => {
      setIsRecording(false);
      clearInterval(interval);
      // Mock audio blob
      setAudioBlob(new Blob(['mock audio data'], { type: 'audio/wav' }));
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playPause = () => {
    setIsPlaying(!isPlaying);
    // Mock play/pause functionality
  };

  const sendVoiceMessage = () => {
    if (audioBlob) {
      onSend(audioBlob);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-purple-200 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {!audioBlob ? (
            <>
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className={`rounded-full w-12 h-12 ${
                  !isRecording ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : ''
                }`}
                onClick={isRecording ? () => {} : startRecording}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              
              <div className="flex-1">
                {isRecording ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-500 font-medium">Recording {formatTime(recordingTime)}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">Tap to record voice message</span>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-12 h-12"
                onClick={playPause}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 w-1/3 transition-all duration-300"></div>
                  </div>
                  <span className="text-sm text-gray-500">{formatTime(recordingTime)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={sendVoiceMessage}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Send
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceMessage;
