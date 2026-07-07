import { useState, useRef, useEffect, useMemo } from 'react';
import { Bot, User, Send, PlusCircle, MessageSquare, X, ImagePlus, CheckCircle2, LoaderCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  DEFAULT_CHAT_USER_ID,
  appendChatMemoryMessages,
  createChatMemoryState,
  deleteChatMemorySession,
  ensureChatMemoryForUser,
  getChatUserMemory,
  loadChatMemoryState,
  replaceLastChatMemoryMessage,
  saveChatMemoryState,
  setActiveChatMemorySession,
  startChatMemorySession,
  toChatHistory,
} from '../lib/chatMemory';
import {
  appendChatMessagesToSupabase,
  deleteChatSessionFromSupabase,
  fetchChatUserMemoryFromSupabase,
} from '../lib/chatSupabase';
import { supabase } from '../lib/supabaseClient';
import { uploadImagesToR2 } from '../lib/imageUpload';

export default function Chatbot() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const userId = currentUser?.id ?? DEFAULT_CHAT_USER_ID;
  const introMessage = useMemo<ChatMessage>(() => createIntroMessage(t('chatbot.intro')), [t]);
  const [chatMemory, setChatMemory] = useState(() => {
    if (typeof window === 'undefined') {
      return createChatMemoryState();
    }

    return loadChatMemoryState(window.localStorage);
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0, fileName: '' });
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userMemory = getChatUserMemory(chatMemory, userId, introMessage);
  const messages = userMemory.messages;
  const selectedImagePreviews = useMemo(
    () => selectedImages.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [selectedImages],
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setChatMemory((currentMemory) => ensureChatMemoryForUser(currentMemory, userId, introMessage));
  }, [introMessage, userId]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    void fetchChatUserMemoryFromSupabase(supabase, userId, introMessage)
      .then((remoteMemory) => {
        const hasRemoteMessages = remoteMemory.sessions.some((session) =>
          session.messages.some((message) => message.role === 'user'),
        );

        if (!hasRemoteMessages) {
          return;
        }

        setChatMemory((currentMemory) => ({
          sessionsByUserId: {
            ...currentMemory.sessionsByUserId,
            [userId]: remoteMemory,
          },
        }));
      })
      .catch((error) => {
        console.warn('Chat Supabase sync skipped:', error);
      });
  }, [currentUser, introMessage, userId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveChatMemoryState(window.localStorage, chatMemory);
    }
  }, [chatMemory]);

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedImagePreviews]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImages.length) || isLoading) return;
    const messageText = input.trim() || 'Please read these uploaded images and explain the important details.';
    const imagesToUpload = [...selectedImages];
    setIsLoading(true);
    setUploadError('');
    setUploadProgress({
      completed: 0,
      total: imagesToUpload.length,
      fileName: imagesToUpload[0]?.name ?? '',
    });

    let imageUrls: string[] = [];
    try {
      if (imagesToUpload.length) {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw new Error(error.message);
        }

        const uploads = await uploadImagesToR2(imagesToUpload, data.session?.access_token ?? '', {
          folder: 'chat',
          attachedToType: 'chat',
          onProgress: (progress) => setUploadProgress(progress),
        });
        imageUrls = uploads.map((upload) => upload.publicUrl);
      }
    } catch (error) {
      setIsLoading(false);
      setUploadError(getErrorMessage(error));
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      imageUrls,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const botMessage: ChatMessage = {
      role: 'bot',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const history = toChatHistory(messages);
    const activeSessionId = userMemory.activeSessionId;
    const sessionTitle = messageText.slice(0, 42);

    setChatMemory((currentMemory) =>
      appendChatMemoryMessages(currentMemory, userId, [userMessage, botMessage]),
    );
    setInput('');
    setSelectedImages([]);
    setUploadProgress({ completed: 0, total: 0, fileName: '' });

    try {
      const requestStartedAt = performance.now();
      let loggedFirstChunk = false;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, history, userId, imageUrls })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || t('chatbot.error'));
      }

      if (!response.body) {
        const text = await response.text();
        const finalBotMessage = {
          ...botMessage,
          content: text || t('chatbot.error'),
        };
        setChatMemory((currentMemory) =>
          replaceLastChatMemoryMessage(currentMemory, userId, finalBotMessage),
        );
        void persistChatTurn(activeSessionId, sessionTitle, [userMessage, finalBotMessage]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = '';
      let sawFirstChunk = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) {
          continue;
        }

        if (!sawFirstChunk) {
          sawFirstChunk = true;
          if (!loggedFirstChunk) {
            loggedFirstChunk = true;
            console.log(`first time we received first chunk: ${Math.round(performance.now() - requestStartedAt)}ms`);
          }
          setIsLoading(false);
        }

        streamedText += chunk;
        setChatMemory((currentMemory) =>
          replaceLastChatMemoryMessage(currentMemory, userId, {
            ...botMessage,
            content: streamedText,
          }),
        );
      }

      const remainingText = decoder.decode();
      if (remainingText) {
        streamedText += remainingText;
      }

      if (!streamedText) {
        const finalBotMessage = {
          ...botMessage,
          content: t('chatbot.error'),
        };
        setChatMemory((currentMemory) =>
          replaceLastChatMemoryMessage(currentMemory, userId, finalBotMessage),
        );
      } else {
        void persistChatTurn(activeSessionId, sessionTitle, [
          userMessage,
          { ...botMessage, content: streamedText },
        ]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const finalBotMessage = {
        ...botMessage,
        content: t('chatbot.error'),
      };
      setChatMemory((currentMemory) =>
        replaceLastChatMemoryMessage(currentMemory, userId, finalBotMessage),
      );
      void persistChatTurn(activeSessionId, sessionTitle, [userMessage, finalBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectImages = (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    setUploadError('');
    setUploadProgress({ completed: 0, total: 0, fileName: '' });
    setSelectedImages((currentImages) => [...currentImages, ...Array.from(files)].slice(0, 6));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveSelectedImage = (index: number) => {
    setUploadProgress({ completed: 0, total: 0, fileName: '' });
    setSelectedImages((currentImages) => currentImages.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleNewChat = () => {
    setChatMemory((currentMemory) => startChatMemorySession(currentMemory, userId, introMessage));
    setInput('');
    setIsLoading(false);
    setUploadProgress({ completed: 0, total: 0, fileName: '' });
  };

  const handleOpenSession = (sessionId: string) => {
    setChatMemory((currentMemory) => setActiveChatMemorySession(currentMemory, userId, sessionId));
    setInput('');
    setIsLoading(false);
    setUploadProgress({ completed: 0, total: 0, fileName: '' });
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatMemory((currentMemory) =>
      deleteChatMemorySession(currentMemory, userId, sessionId, introMessage),
    );
    if (currentUser) {
      void deleteChatSessionFromSupabase(supabase, sessionId, userId).catch((error) => {
        console.warn('Unable to delete chat session from Supabase:', error);
      });
    }
    setInput('');
    setIsLoading(false);
  };

  const persistChatTurn = (sessionId: string, title: string, turnMessages: ChatMessage[]) => {
    if (!currentUser) {
      return;
    }

    return appendChatMessagesToSupabase(supabase, {
      sessionId,
      userId,
      title,
      messages: turnMessages,
    }).catch((error) => {
      console.warn('Unable to save chat messages to Supabase:', error);
    });
  };

  const suggestions = [
    t('chatbot.suggestion.visas'),
    t('chatbot.suggestion.checklist'),
    t('chatbot.suggestion.wait'),
    t('chatbot.suggestion.realId'),
  ];
  const uploadPercent =
    uploadProgress.total > 0 ? Math.round((uploadProgress.completed / uploadProgress.total) * 100) : 0;

  return (
    <div className="pt-20 pb-40 max-w-lg mx-auto flex flex-col h-[100dvh]">
      {/* Bot Intro */}
      <div className="flex flex-col items-center justify-center mb-8 shrink-0">
        <div className="relative mb-3">
          <BotAvatar size="large" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">CaliBot</h1>
        <p className="text-sm text-on-surface-variant text-center max-w-xs mt-2 px-4 leading-relaxed">
          {t('chatbot.intro')}
        </p>
        <div className="mt-4 px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-widest">
          {t('chatbot.status')}
        </div>
      </div>

      <div className="mb-4 px-4 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm transition-colors hover:bg-primary-container hover:text-white"
          >
            <PlusCircle size={15} />
            {t('chatbot.newChat')}
          </button>
          {userMemory.sessions.map((session) => (
            <div
              key={session.id}
              className={`inline-flex max-w-56 shrink-0 items-center rounded-full shadow-sm transition-colors ${
                session.id === userMemory.activeSessionId
                  ? 'bg-primary text-white'
                  : 'border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <button
                type="button"
                onClick={() => handleOpenSession(session.id)}
                className="inline-flex min-w-0 items-center gap-2 rounded-l-full py-2 pl-3 pr-1 text-xs font-semibold"
              >
                <MessageSquare size={14} className="shrink-0" />
                <span className="truncate">{session.title}</span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${session.title}`}
                onClick={() => handleDeleteSession(session.id)}
                className={`mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                  session.id === userMemory.activeSessionId
                    ? 'text-white/80 hover:bg-white/20 hover:text-white'
                    : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                }`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-4 space-y-6 flex flex-col no-scrollbar"
      >
        {messages.map((msg, i) => {
          if (!msg.content && msg.role === 'bot') {
            return null;
          }

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={i} 
              className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {msg.role === 'user' ? (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                  <User size={16} />
                </div>
              ) : (
                <BotAvatar size="small" />
              )}
              <div className={`p-4 rounded-2xl shadow-sm border ${
                msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none border-primary' 
                : 'bg-white text-on-surface rounded-tl-none border-outline-variant'
              }`}>
                {!!msg.imageUrls?.length && (
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    {msg.imageUrls.map((imageUrl, imageIndex) => (
                      <div
                        key={`${imageUrl}-${imageIndex}`}
                        className="overflow-hidden rounded-xl border border-white/20 bg-white/10"
                      >
                        <img
                          src={imageUrl}
                          alt={`Uploaded chat image ${imageIndex + 1}`}
                          className="h-24 w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                            const fallback = event.currentTarget.nextElementSibling;
                            fallback?.classList.remove('hidden');
                          }}
                        />
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hidden h-24 items-center justify-center px-2 text-center text-[10px] font-bold underline"
                        >
                          Image uploaded, but cannot display.
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <span className={`text-[10px] mt-2 block ${msg.role === 'user' ? 'text-white/70 text-right' : 'text-on-surface-variant'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          );
        })}
        {isLoading && !messages[messages.length - 1]?.content && (
          <div className="flex items-start gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-outline-variant shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        {/* Suggestion Chips */}
        {messages.length < 3 && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => setInput(s)}
                className="bg-white border border-primary text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary-container hover:text-white transition-all shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-24 left-0 w-full px-4 z-40 bg-gradient-to-t from-background via-background/80 to-transparent pt-8">
        <div className="max-w-lg mx-auto">
          {uploadError && (
            <div className="mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {uploadError}
            </div>
          )}
          {!!selectedImagePreviews.length && (
            <div className="mb-2 rounded-2xl border border-outline-variant bg-white p-2 shadow-sm">
              <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-semibold text-on-surface-variant">
                <span>{selectedImagePreviews.length} image{selectedImagePreviews.length === 1 ? '' : 's'} selected</span>
                <span>Max 8 MB each</span>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {selectedImagePreviews.map((preview, index) => {
                  const isUploaded = isLoading && uploadProgress.completed > index;
                  const isUploading =
                    isLoading &&
                    uploadProgress.completed === index &&
                    uploadProgress.total === selectedImagePreviews.length;

                  return (
                    <div key={`${preview.name}-${preview.url}`} className="relative h-16 w-16 shrink-0">
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="h-full w-full rounded-xl object-cover"
                      />
                      <div className="absolute inset-x-1 bottom-1 truncate rounded bg-black/55 px-1 py-0.5 text-[8px] font-bold text-white">
                        {isUploaded ? 'Uploaded' : isUploading ? 'Uploading' : preview.name}
                      </div>
                      {isUploaded && (
                        <div className="absolute left-1 top-1 rounded-full bg-green-600 text-white">
                          <CheckCircle2 size={15} />
                        </div>
                      )}
                      {isUploading && (
                        <div className="absolute left-1 top-1 rounded-full bg-primary p-0.5 text-white">
                          <LoaderCircle size={13} className="animate-spin" />
                        </div>
                      )}
                      <button
                        type="button"
                        aria-label={`Remove ${preview.name}`}
                        disabled={isLoading}
                        onClick={() => handleRemoveSelectedImage(index)}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm disabled:cursor-not-allowed disabled:bg-outline"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {isLoading && uploadProgress.total > 0 && (
            <div className="mb-2 rounded-2xl border border-primary/20 bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-primary">
                <span>
                  Uploading {uploadProgress.completed} of {uploadProgress.total}
                </span>
                <span>{uploadPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>
              <p className="mt-2 truncate text-xs text-on-surface-variant">
                {uploadProgress.completed === uploadProgress.total
                  ? 'Images uploaded. Asking CaliBot...'
                  : `Uploading ${uploadProgress.fileName || 'image'}...`}
              </p>
            </div>
          )}
          <div className="bg-white border border-outline-variant rounded-2xl p-2.5 flex items-center gap-2 shadow-xl mb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(event) => handleSelectImages(event.target.files)}
            />
            <button
              type="button"
              aria-label="Upload images"
              onClick={() => fileInputRef.current?.click()}
              className="text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full transition-colors"
            >
              <ImagePlus size={24} />
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-2 px-1" 
              placeholder={t('chatbot.placeholder')} 
              type="text"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !selectedImages.length)}
              className="bg-primary text-white w-10 h-10 flex items-center justify-center rounded-full hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function createIntroMessage(content: string): ChatMessage {
  return {
    role: 'bot',
    content,
    timestamp: '10:02 AM',
  };
}

function BotAvatar({ size }: { size: 'large' | 'small' }) {
  const isLarge = size === 'large';

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full shadow-sm ${
        isLarge
          ? 'h-16 w-16 bg-primary-container shadow-md'
          : 'h-8 w-8 bg-surface-container-high text-primary'
      }`}
    >
      <Bot size={isLarge ? 32 : 16} className={isLarge ? 'text-white' : 'text-primary'} fill="currentColor" />
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to upload images';
}
