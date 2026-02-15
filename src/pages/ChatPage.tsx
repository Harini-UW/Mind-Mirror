import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { personas, PersonaId } from "@/lib/personas";
import { streamChat, Msg } from "@/lib/streamChat";
import { Mic, MicOff, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import duckMascot from "@/assets/duck-mascot.png";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import DuckPopup from "@/components/DuckPopup";
import UserChecks from "@/components/UserChecks";
import TabNavigation, { ActiveTab } from "@/components/TabNavigation";
import SummaryView from "@/components/SummaryView";
import MindMapView from "@/components/MindMapView";
import IntakeForm from "@/components/IntakeForm";
import { useDuckQuotes } from "@/hooks/useDuckQuotes";

const ChatPage = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const navigate = useNavigate();
  const persona = personas[personaId as PersonaId];

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dontRepeat, setDontRepeat] = useState(false);
  const [redirectNext, setRedirectNext] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  // Only show duck popup when on chat tab
  const { quote, visible, dismiss, resetActivity } = useDuckQuotes(activeTab === "chat");

  useEffect(() => {
    if (!persona) navigate("/");
  }, [persona, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || isPaused) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const flags = {
      dontRepeat,
      redirect: redirectNext,
    };

    // Reset one-shot redirect flag
    if (redirectNext) setRedirectNext(false);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: [...messages, userMsg],
      persona: personaId!,
      onDelta: upsertAssistant,
      onDone: () => setIsLoading(false),
      onError: (err) => { toast.error(err); setIsLoading(false); },
      flags,
    });
  }, [messages, isLoading, isPaused, personaId, dontRepeat, redirectNext]);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported in this browser"); return; }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput((prev) => prev + text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleRedirect = () => {
    // Just set the flag - conversation continues with new angle
    setRedirectNext(true);
    toast.success("Next response will explore a different angle.");
  };

  const handleNewSession = () => {
    setMessages([]);
    setIsPaused(false);
    setDontRepeat(false);
    setRedirectNext(false);
    setActiveTab("chat");
  };

  if (!persona) return null;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Duck Popup */}
      <DuckPopup quote={quote} visible={visible} onDismiss={dismiss} />

      {/* Background */}
      <img
        src={persona.background}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      />
      <div className="absolute inset-0 bg-background/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 border-b border-border/50 bg-card/70 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <img src={persona.avatar} alt={persona.name} className="w-8 h-8 pixel-border object-cover" />
            <span className={`font-pixel text-xs ${persona.colorClass}`}>{persona.name}</span>
          </div>
          <img src={duckMascot} alt="Captain Quack" className="w-10 h-10 object-contain animate-float" />
        </div>

        {/* Main Content Area */}
        {activeTab === "chat" && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* Intake form at start */}
              {messages.length === 0 && (
                <IntakeForm
                  onSubmit={(intakeData) => send(intakeData)}
                  personaColor={persona.colorClass.includes("blue") ? "#5B8FA3" : persona.colorClass.includes("red") ? "#C84B31" : "#8B5A99"}
                />
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-4 py-3 font-retro text-lg leading-relaxed ${
                      msg.role === "user"
                        ? "bg-secondary/80 text-foreground pixel-border"
                        : "bg-card/80 text-foreground pixel-border"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_p]:last:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start mb-3">
                  <div className="bg-card/80 px-4 py-3 pixel-border">
                    <span className="font-retro text-lg text-muted-foreground animate-pulse">thinking...</span>
                  </div>
                </div>
              )}

              {isPaused && (
                <div className="flex justify-center my-4">
                  <div className="pixel-border bg-destructive/10 px-4 py-2">
                    <span className="font-retro text-base text-destructive">Paused</span>
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            {/* Input bar - only show after intake form is completed */}
            {messages.length > 0 && (
              <div className="p-3 border-t border-border/50 bg-card/70 backdrop-blur-sm">
                <div className="flex items-center gap-2 max-w-2xl mx-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleVoice}
                    className={isListening ? "text-destructive" : "text-muted-foreground"}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  <input
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      resetActivity();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
                    placeholder="What's on your mind..."
                    className="flex-1 bg-secondary/60 border border-border px-4 py-2.5 font-retro text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={isLoading || isPaused}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => send(input)}
                    disabled={!input.trim() || isLoading || isPaused}
                    className="text-primary"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* User Checks - only show after intake form is completed */}
            {messages.length > 0 && (
              <UserChecks
                dontRepeat={dontRepeat}
                isPaused={isPaused}
                onDontRepeat={() => setDontRepeat((prev) => !prev)}
                onRedirect={handleRedirect}
                onPauseToggle={() => setIsPaused((prev) => !prev)}
              />
            )}
          </>
        )}

        {activeTab === "summary" && (
          <SummaryView
            messages={messages}
            onViewMindMap={() => setActiveTab("mindmap")}
            onNewSession={handleNewSession}
          />
        )}

        {activeTab === "mindmap" && (
          <MindMapView
            messages={messages}
            personaColor={
              personaId === "sage" ? "hsl(200, 55%, 45%)" :
              personaId === "rational" ? "hsl(10, 75%, 48%)" :
              "hsl(270, 45%, 42%)"
            }
          />
        )}

        {/* Tab Navigation - only show after intake form is completed */}
        {messages.length > 0 && (
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            personaColorClass={persona.colorClass}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
