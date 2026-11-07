/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types.ts';
import { TRANSLATIONS } from '../utils/translations.ts';
import {
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
  language: Language;
  isLoading: boolean;
}

export const ChatDiasTab: React.FC<Props> = ({
  messages,
  onSendMessage,
  onClearChat,
  language,
  isLoading,
}) => {
  const t = TRANSLATIONS[language];
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    await onSendMessage(text);
  };

  const quickPrompts = [
    t.quickPrompt1,
    t.quickPrompt2,
    t.quickPrompt3,
    t.quickPrompt4,
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto px-4 pb-20 pt-2">
      {/* Header bar */}
      <div className="py-2 flex items-center justify-between border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0e7c66] to-[#e8973a] text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-1.5">
              <span>{t.chatTitle}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {t.chatSubtitle}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            title={t.clearChat}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grounding & Safety Disclaimer */}
      <div className="my-2 p-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center gap-2 text-[11px] text-emerald-900 dark:text-emerald-300">
        <ShieldCheck className="w-4 h-4 text-[#0e7c66] shrink-0" />
        <span>{t.chatDisclaimer}</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-2">
        {/* Welcome message from Dias */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0e7c66] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl rounded-tl-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 text-stone-800 dark:text-stone-200 text-xs sm:text-sm shadow-sm leading-relaxed">
            {t.chatWelcome}
          </div>
        </div>

        {/* Dynamic chat messages */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                  isUser
                    ? 'bg-[#e8973a] text-white'
                    : 'bg-[#0e7c66] text-white'
                }`}
              >
                {isUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  isUser
                    ? 'rounded-tr-sm bg-gradient-to-r from-[#e8973a] to-[#d28227] text-white'
                    : 'rounded-tl-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 text-stone-800 dark:text-stone-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-2.5 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-[#0e7c66] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0e7c66] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#e8973a] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#0e7c66] animate-bounce [animation-delay:0.4s]" />
              <span>{t.thinking}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      {messages.length < 2 && (
        <div className="py-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(prompt)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[11px] font-medium whitespace-nowrap hover:bg-[#0e7c66] hover:text-white dark:hover:bg-[#0e7c66] transition-all cursor-pointer active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Field & Send Button (Thumb-reachable bottom) */}
      <form onSubmit={handleSend} className="pt-2 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.chatPlaceholder}
          disabled={isLoading}
          className="flex-1 py-3 px-4 rounded-2xl bg-white dark:bg-stone-800 text-stone-900 dark:text-white border border-stone-200 dark:border-stone-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7c66] shadow-sm disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="w-12 h-12 rounded-2xl bg-[#0e7c66] hover:bg-[#0b6754] disabled:opacity-40 text-white flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer shrink-0"
          aria-label={t.send}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
