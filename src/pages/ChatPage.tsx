// bring in state tracking tools
import { useState, useRef, useEffect, useCallback } from "react";
// bring in url reading tools
import { useParams, useNavigate } from "react-router-dom";
// bring in character list
import { personas, PersonaId } from "@/lib/personas";
// bring in ai chat tool
import { streamChat, Msg } from "@/lib/streamChat";
// bring in button pictures
import { Mic, MicOff, Send, ArrowLeft } from "lucide-react";
// bring in button component
import { Button } from "@/components/ui/button";
// bring in duck picture
import duckMascot from "@/assets/duck-mascot.png";
// bring in popup message tool
import { toast } from "sonner";
// bring in text display tool
import ReactMarkdown from "react-markdown";
// bring in all custom parts
import DuckPopup from "@/components/DuckPopup";
import UserChecks from "@/components/UserChecks";
import TabNavigation, { ActiveTab } from "@/components/TabNavigation";
import SummaryView from "@/components/SummaryView";
import MindMapView from "@/components/MindMapView";
import IntakeForm from "@/components/IntakeForm";
import { useDuckQuotes } from "@/hooks/useDuckQuotes";

// main chat page where you talk
const ChatPage = () => {
  // get which character from web address
  const { personaId } = useParams<{ personaId: string }>();
  // tool to change pages
  const navigate = useNavigate();
  // get character info from list
  const persona = personas[personaId as PersonaId];

  // remember all chat messages
  const [messages, setMessages] = useState<Msg[]>([]);
  // remember what user is typing
  const [input, setInput] = useState("");
  // remember if ai is thinking
  const [isLoading, setIsLoading] = useState(false);
  // remember if microphone is on
  const [isListening, setIsListening] = useState(false);
  // remember if chat is paused
  const [isPaused, setIsPaused] = useState(false);
  // remember if user wants no repeats
  const [dontRepeat, setDontRepeat] = useState(false);
  // remember if user wants new direction
  const [redirectNext, setRedirectNext] = useState(false);
  // remember which tab is showing
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  // remember bottom of chat for scrolling
  const scrollRef = useRef<HTMLDivElement>(null);
  // remember microphone connection
  const recognitionRef = useRef<any>(null);
  // get duck popup quote and controls
  const { quote, visible, dismiss, resetActivity } = useDuckQuotes(activeTab === "chat");

  // run once when page loads
  useEffect(() => {
    // go home if no character found
    if (!persona) navigate("/");
  }, [persona, navigate]);

  // run every time messages change
  useEffect(() => {
    // scroll to bottom of chat
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // function to send message to ai
  const send = useCallback(async (text: string) => {
    // stop if empty or busy or paused
    if (!text.trim() || isLoading || isPaused) return;
    // make user message object
    const userMsg: Msg = { role: "user", content: text.trim() };
    // add user message to chat
    setMessages((prev) => [...prev, userMsg]);
    // clear input box
    setInput("");
    // show ai is thinking
    setIsLoading(true);

    // prepare user control flags
    const flags = {
      dontRepeat,
      redirect: redirectNext,
    };

    // turn off redirect after using once
    if (redirectNext) setRedirectNext(false);

    // collect ai response pieces
    let assistantSoFar = "";
    // function to add ai text chunks
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

    // call ai with all messages
    await streamChat({
      messages: [...messages, userMsg],
      persona: personaId!,
      onDelta: upsertAssistant,
      onDone: () => setIsLoading(false),
      onError: (err) => { toast.error(err); setIsLoading(false); },
      flags,
    });
  }, [messages, isLoading, isPaused, personaId, dontRepeat, redirectNext]);

  // turn microphone on or off
  const toggleVoice = () => {
    // if already listening stop it
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    // find browser voice tool
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    // stop if browser doesnt support it
    if (!SR) { toast.error("Speech recognition not supported in this browser"); return; }
    // make new voice listener
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    // when voice heard add to input
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput((prev) => prev + text);
      setIsListening(false);
    };
    // stop listening on error
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    // save listener reference
    recognitionRef.current = recognition;
    // start listening
    recognition.start();
    setIsListening(true);
  };

  // when user clicks redirect button
  const handleRedirect = () => {
    // turn on redirect flag
    setRedirectNext(true);
    // show success message
    toast.success("Next response will explore a different angle.");
  };

  // when user wants fresh start
  const handleNewSession = () => {
    // clear all messages
    setMessages([]);
    // turn off pause
    setIsPaused(false);
    // turn off dont repeat
    setDontRepeat(false);
    // turn off redirect
    setRedirectNext(false);
    // go back to chat tab
    setActiveTab("chat");
  };

  // stop if character not found
  if (!persona) return null;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* show duck popup if visible */}
      <DuckPopup quote={quote} visible={visible} onDismiss={dismiss} />

      {/* show character background picture */}
      <img
        src={persona.background}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      />
      {/* dim the background a bit */}
      <div className="absolute inset-0 bg-background/50" />

      {/* main page content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* top bar with back button */}
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

        {/* show chat tab content */}
        {activeTab === "chat" && (
          <>
            {/* message display area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* show form before any messages */}
              {messages.length === 0 && (
                <IntakeForm
                  onSubmit={(intakeData) => send(intakeData)}
                  personaColor={persona.colorClass.includes("blue") ? "#5B8FA3" : persona.colorClass.includes("red") ? "#C84B31" : "#8B5A99"}
                />
              )}

              {/* show each message in chat */}
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

              {/* show thinking message while ai loads */}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start mb-3">
                  <div className="bg-card/80 px-4 py-3 pixel-border">
                    <span className="font-retro text-lg text-muted-foreground animate-pulse">thinking...</span>
                  </div>
                </div>
              )}

              {/* show paused message if chat stopped */}
              {isPaused && (
                <div className="flex justify-center my-4">
                  <div className="pixel-border bg-destructive/10 px-4 py-2">
                    <span className="font-retro text-base text-destructive">Paused</span>
                  </div>
                </div>
              )}

              {/* invisible marker for scrolling down */}
              <div ref={scrollRef} />
            </div>

            {/* typing box shows after form filled */}
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

            {/* control buttons show after form filled */}
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

        {/* show summary tab content */}
        {activeTab === "summary" && (
          <SummaryView
            messages={messages}
            onViewMindMap={() => setActiveTab("mindmap")}
            onNewSession={handleNewSession}
          />
        )}

        {/* show mind map tab content */}
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

        {/* tabs show after form filled */}
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
