import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Plus,
  HelpCircle,
  Users,
  AlertCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import chatbotAvatar from "@/assets/chatbot-avatar.png";

interface Message {
  id: string;
  message: string;
  sender_id: string;
  created_at: string;
  message_type: string;
}

interface Conversation {
  id: string;
  subject: string;
  type: string;
  status: string;
  ticket_number?: string;
}

export function EJGChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // New conversation form
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [conversationType, setConversationType] = useState<"support" | "internal" | "help">("help");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      const subscription = supabase
        .channel(`messages:${selectedConversation}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chat_messages",
            filter: `conversation_id=eq.${selectedConversation}`,
          },
          () => {
            loadMessages();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user!.id)
      .order("updated_at", { ascending: false });

    if (data) {
      setConversations(data as Conversation[]);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0].id);
      }
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", selectedConversation)
      .order("created_at", { ascending: true });

    if (data) setMessages(data as Message[]);
  };

  const createConversation = async () => {
    if (!subject.trim()) {
      toast.error("Digite um assunto para a conversa");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: user!.id,
          type: conversationType,
          subject,
          priority,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(
        conversationType === "support" 
          ? `Chamado ${data.ticket_number} aberto com sucesso!`
          : "Conversa iniciada!"
      );

      setConversations([data as Conversation, ...conversations]);
      setSelectedConversation(data.id);
      setShowNewConversation(false);
      setSubject("");
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Erro ao criar conversa");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      // Save user message
      const { error: saveError } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: selectedConversation,
          sender_id: user!.id,
          message: newMessage,
          message_type: "text",
        });

      if (saveError) throw saveError;

      const userMessage = newMessage;
      setNewMessage("");

      // Get AI response
      const { data, error } = await supabase.functions.invoke("ejg-chatbot", {
        body: {
          messages: [
            ...messages.map(m => ({
              role: m.sender_id === user!.id ? "user" : "assistant",
              content: m.message,
            })),
            { role: "user", content: userMessage },
          ],
          conversationId: selectedConversation,
          userId: user!.id,
        },
      });

      if (error) throw error;

      // Messages will be updated via realtime subscription
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      support: { label: "Suporte", icon: AlertCircle, color: "text-red-500" },
      internal: { label: "Interno", icon: Users, color: "text-blue-500" },
      help: { label: "Ajuda", icon: HelpCircle, color: "text-green-500" },
    };
    return types[type as keyof typeof types] || types.help;
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed ${
        isMinimized ? "bottom-6 right-6 w-80 h-16" : "bottom-6 right-6 w-96 h-[600px]"
      } shadow-2xl flex flex-col z-50 transition-all`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <img src={chatbotAvatar} alt="EJG Assistant" className="h-10 w-10 rounded-full" />
          <div>
            <h3 className="font-semibold">EJG Assistant</h3>
            <p className="text-xs text-muted-foreground">Assistente Virtual</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Content */}
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="conversations">Conversas</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col p-0">
              {selectedConversation ? (
                <>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender_id === user?.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.sender_id === user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            <span className="text-xs opacity-70">
                              {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      disabled={loading}
                    />
                    <Button onClick={sendMessage} disabled={loading} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-4">
                  <p className="text-muted-foreground text-center">
                    Selecione uma conversa ou inicie uma nova
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="conversations" className="flex-1 flex flex-col p-4">
              <Button
                onClick={() => setShowNewConversation(!showNewConversation)}
                className="mb-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Conversa
              </Button>

              {showNewConversation && (
                <Card className="p-4 mb-4 space-y-3">
                  <Select value={conversationType} onValueChange={(v: any) => setConversationType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="help">Ajuda do Sistema</SelectItem>
                      <SelectItem value="internal">Comunicação Interna</SelectItem>
                      <SelectItem value="support">Abrir Chamado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Assunto"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />

                  {conversationType === "support" && (
                    <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={createConversation} className="flex-1">
                      Criar
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewConversation(false)}>
                      Cancelar
                    </Button>
                  </div>
                </Card>
              )}

              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {conversations.map((conv) => {
                    const typeInfo = getTypeLabel(conv.type);
                    const Icon = typeInfo.icon;

                    return (
                      <Card
                        key={conv.id}
                        className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                          selectedConversation === conv.id ? "bg-accent" : ""
                        }`}
                        onClick={() => {
                          setSelectedConversation(conv.id);
                          setShowNewConversation(false);
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className={`h-4 w-4 mt-1 ${typeInfo.color}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{conv.subject}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {typeInfo.label}
                              </Badge>
                              {conv.ticket_number && (
                                <Badge variant="secondary" className="text-xs">
                                  {conv.ticket_number}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </>
      )}
    </Card>
  );
}