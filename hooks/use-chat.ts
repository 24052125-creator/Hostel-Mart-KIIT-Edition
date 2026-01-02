"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface Message {
    _id: string;
    chatId: string;
    orderId: string;
    senderId: string;
    senderType: "buyer" | "seller";
    text: string;
    createdAt: string;
    updatedAt: string;
}

interface UseChatOptions {
    orderId: string;
    enabled?: boolean;
}

export function useChat({ orderId, enabled = true }: UseChatOptions) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const pollingRef = useRef<boolean>(false);

    // Fetch initial chat history
    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Not authenticated");
            }

            const res = await fetch(`/api/chat/history?orderId=${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch chat history");
            }

            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error("Error fetching chat history:", err);
            setError(err instanceof Error ? err.message : "Failed to load messages");
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    // Keep a ref to messages to access latest state in polling loop without restarting it
    const messagesRef = useRef<Message[]>([]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Long polling for new messages
    const pollMessages = useCallback(async () => {
        if (!enabled || pollingRef.current) return;

        pollingRef.current = true;
        const token = localStorage.getItem("token");

        if (!token) {
            pollingRef.current = false;
            return;
        }

        while (pollingRef.current) {
            try {
                abortControllerRef.current = new AbortController();
                // Read from ref to get latest messages without closure staleness
                const currentMessages = messagesRef.current;
                const lastMessageId = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1]._id : "";

                const res = await fetch(
                    `/api/chat/messages?orderId=${orderId}${lastMessageId ? `&lastMessageId=${lastMessageId}` : ""}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: abortControllerRef.current.signal,
                    }
                );

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    // Don't throw for 304 or timeout, just continue
                    if (res.status !== 504 && res.status !== 408) {
                        // Log but don't stop strictly unless auth error
                        console.error("Polling error:", errorData);
                    }
                    if (res.status === 401 || res.status === 403) {
                        pollingRef.current = false; // Stop on auth error
                        break;
                    }
                    // Continue loop even on error after delay
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    continue;
                }

                const newMessages = await res.json();

                if (newMessages.length > 0) {
                    setMessages((prev) => {
                        // Deduplicate just in case
                        const existingIds = new Set(prev.map(m => m._id));
                        const uniqueNewMessages = newMessages.filter((m: Message) => !existingIds.has(m._id));
                        if (uniqueNewMessages.length === 0) return prev;
                        return [...prev, ...uniqueNewMessages];
                    });
                }
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    console.error("Error polling messages:", err);
                    // Wait 2 seconds before retrying on error
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            }
        }
    }, [orderId, enabled]); // Removed 'messages' dependency

    // Send message
    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        try {
            setSending(true);
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Not authenticated");
            }

            const res = await fetch("/api/chat/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    orderId,
                    text: text.trim(),
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to send message");
            }

            const result = await res.json();
            setMessages((prev) => [...prev, result.data]);
        } catch (err) {
            console.error("Error sending message:", err);
            toast.error("Failed to send message");
            throw err;
        } finally {
            setSending(false);
        }
    };

    // Initialize: fetch history and start polling
    useEffect(() => {
        if (!enabled) return;

        fetchHistory();
    }, [fetchHistory, enabled]);

    // Start polling after history is loaded
    useEffect(() => {
        if (!enabled || loading) return;

        pollMessages();

        return () => {
            pollingRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [pollMessages, enabled, loading]);

    return {
        messages,
        loading,
        sending,
        error,
        sendMessage,
        refetch: fetchHistory,
    };
}
