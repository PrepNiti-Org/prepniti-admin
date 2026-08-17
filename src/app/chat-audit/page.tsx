"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../lib/api";
import {
    ShieldAlert,
    KeyRound,
    Lock,
    Unlock,
    MessageSquare,
    Search,
    Loader2,
    Users,
    Calendar,
    ChevronRight,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertTriangle,
    RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";

interface ChatMember {
    id: string;
    username: string;
    email: string;
}

interface AdminChatRoom {
    id: string;
    name?: string;
    is_group: boolean;
    members: ChatMember[];
    message_count: number;
    created_at: string;
}

interface ChatMessage {
    id: number;
    room_id: string;
    sender_id: string;
    content?: string;
    ciphertext?: string;
    iv?: string;
    envelopes?: string | Record<string, string>;
    is_encrypted: boolean;
    created_at: string;
    sender?: {
        id: string;
        username: string;
        email?: string;
    };
}

// Helpers for Base64 and ArrayBuffer conversion for WebCrypto in Admin
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function pemToBinary(pem: string): ArrayBuffer {
    const cleanPem = pem
        .replace(/-----BEGIN [^-]+-----/g, "")
        .replace(/-----END [^-]+-----/g, "")
        .replace(/\s+/g, "");
    return base64ToArrayBuffer(cleanPem);
}

async function importAdminPrivateKey(pem: string): Promise<CryptoKey> {
    const binary = pemToBinary(pem);
    return await window.crypto.subtle.importKey(
        "pkcs8",
        binary,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );
}

async function decryptAdminMessage(msg: ChatMessage, adminPrivKey: CryptoKey): Promise<string> {
    if (!msg.is_encrypted || !msg.ciphertext || !msg.iv || !msg.envelopes) {
        return msg.content || "";
    }

    try {
        let envelopesObj: Record<string, string>;
        if (typeof msg.envelopes === "string") {
            envelopesObj = JSON.parse(msg.envelopes);
        } else {
            envelopesObj = msg.envelopes;
        }

        const adminWrappedDek = envelopesObj["admin"];
        if (!adminWrappedDek) {
            return "[🔒 Admin escrow envelope not present in this message]";
        }

        // 1. Unwrap DEK with Admin Private Key
        const wrappedDekBuffer = base64ToArrayBuffer(adminWrappedDek);
        const rawDek = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            adminPrivKey,
            wrappedDekBuffer
        );

        // 2. Import raw DEK as AES-GCM Key
        const dek = await window.crypto.subtle.importKey(
            "raw",
            rawDek,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        // 3. Decrypt ciphertext
        const ivBuffer = base64ToArrayBuffer(msg.iv);
        const ciphertextBuffer = base64ToArrayBuffer(msg.ciphertext);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
            dek,
            ciphertextBuffer
        );

        return new TextDecoder().decode(decryptedBuffer);
    } catch (err) {
        console.error("Admin decryption failed:", err);
        return "[🔒 Decryption failed: invalid admin key or corrupted ciphertext]";
    }
}

export default function ChatAuditPage() {
    const [rooms, setRooms] = useState<AdminChatRoom[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoom, setSelectedRoom] = useState<AdminChatRoom | null>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [decryptedContents, setDecryptedContents] = useState<Record<number, string>>({});
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Admin Escrow Key State
    const [adminKeyPEM, setAdminKeyPEM] = useState("");
    const [adminCryptoKey, setAdminCryptoKey] = useState<CryptoKey | null>(null);
    const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
    const [showRawDetails, setShowRawDetails] = useState<Record<number, boolean>>({});

    // Load saved key from sessionStorage on mount
    useEffect(() => {
        const savedKey = sessionStorage.getItem("prepniti_admin_escrow_key");
        if (savedKey) {
            setAdminKeyPEM(savedKey);
            importAdminPrivateKey(savedKey)
                .then(key => setAdminCryptoKey(key))
                .catch(err => console.warn("Failed to import saved admin key:", err));
        }
    }, []);

    // Load rooms list
    const loadRooms = () => {
        setLoadingRooms(true);
        api.get("/admin/chat/rooms")
            .then(res => {
                setRooms(res.data?.data || []);
            })
            .catch(() => {
                toast.error("Failed to load chat rooms.");
            })
            .finally(() => {
                setLoadingRooms(false);
            });
    };

    useEffect(() => {
        loadRooms();
    }, []);

    // Load messages when selected room changes
    const loadMessagesForRoom = (room: AdminChatRoom) => {
        setSelectedRoom(room);
        setLoadingMessages(true);
        setDecryptedContents({});

        api.get(`/admin/chat/rooms/${room.id}/messages`)
            .then(async (res) => {
                const msgs: ChatMessage[] = res.data?.data || [];
                setMessages(msgs);

                // Auto-decrypt if admin key is ready
                if (adminCryptoKey) {
                    const decryptedMap: Record<number, string> = {};
                    for (const m of msgs) {
                        decryptedMap[m.id] = await decryptAdminMessage(m, adminCryptoKey);
                    }
                    setDecryptedContents(decryptedMap);
                }
            })
            .catch(() => {
                toast.error("Failed to load room messages.");
            })
            .finally(() => {
                setLoadingMessages(false);
            });
    };

    // Trigger batch decryption when adminCryptoKey is updated
    useEffect(() => {
        if (!adminCryptoKey || messages.length === 0) return;

        const decryptAll = async () => {
            const decryptedMap: Record<number, string> = {};
            for (const m of messages) {
                decryptedMap[m.id] = await decryptAdminMessage(m, adminCryptoKey);
            }
            setDecryptedContents(decryptedMap);
        };

        decryptAll();
    }, [adminCryptoKey, messages]);

    // Handle Admin Key Save
    const handleSaveAdminKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminKeyPEM.trim()) {
            toast.error("Please enter a valid RSA Private Key in PEM format.");
            return;
        }

        try {
            const importedKey = await importAdminPrivateKey(adminKeyPEM.trim());
            setAdminCryptoKey(importedKey);
            sessionStorage.setItem("prepniti_admin_escrow_key", adminKeyPEM.trim());
            setIsKeyModalOpen(false);
            toast.success("Admin Master Escrow Key loaded successfully!");
        } catch (err) {
            console.error("Key import error:", err);
            toast.error("Invalid RSA Private Key format. Ensure standard PKCS#8 PEM format.");
        }
    };

    // Filter rooms
    const filteredRooms = useMemo(() => {
        if (!searchQuery.trim()) return rooms;
        const q = searchQuery.toLowerCase();
        return rooms.filter(r => {
            if (r.name && r.name.toLowerCase().includes(q)) return true;
            return r.members.some(m => m.username.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
        });
    }, [rooms, searchQuery]);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header with Master Key Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-black tracking-tight">Chat Audit & Compliance</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Inspect and audit end-to-end encrypted conversations using the Administrator Master Escrow Key.
                    </p>
                </div>

                {/* Key Status Pill */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsKeyModalOpen(true)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border ${
                            adminCryptoKey
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
                                : "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 animate-pulse"
                        }`}
                    >
                        <KeyRound className="h-4 w-4" />
                        <span>{adminCryptoKey ? "Escrow Key Active" : "Load Master Escrow Key"}</span>
                        {adminCryptoKey ? <CheckCircle2 className="h-3.5 w-3.5 ml-1" /> : <AlertTriangle className="h-3.5 w-3.5 ml-1" />}
                    </button>

                    <button
                        onClick={loadRooms}
                        disabled={loadingRooms}
                        className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Refresh Conversations"
                    >
                        <RefreshCw className={`h-4 w-4 ${loadingRooms ? "animate-spin text-primary" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Main Content Grid: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Column 1: Conversations List (4 cols) */}
                <div className="lg:col-span-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Filter by user or room name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                        {loadingRooms ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : filteredRooms.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-border rounded-2xl">
                                <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                                <p className="text-xs text-muted-foreground font-medium">No chat conversations found.</p>
                            </div>
                        ) : (
                            filteredRooms.map((room) => {
                                const isSelected = selectedRoom?.id === room.id;
                                const title = room.is_group ? (room.name || "Group Chat") : (room.members.map(m => m.username).join(" & ") || "Direct Message");

                                return (
                                    <div
                                        key={room.id}
                                        onClick={() => loadMessagesForRoom(room)}
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                            isSelected
                                                ? "bg-primary/10 border-primary shadow-sm"
                                                : "bg-card hover:bg-muted/50 border-border"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center space-x-2.5">
                                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                                    room.is_group ? "bg-accent/20 text-accent-foreground" : "bg-primary/15 text-primary"
                                                }`}>
                                                    {room.is_group ? <Users className="h-4 w-4" /> : title.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-foreground line-clamp-1">{title}</h4>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        {room.members.length} member{room.members.length === 1 ? "" : "s"} • {room.message_count} msg{room.message_count === 1 ? "" : "s"}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isSelected ? "text-primary translate-x-0.5" : ""}`} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Column 2: Message Stream & Audit Inspection (8 cols) */}
                <div className="lg:col-span-8">
                    <Card className="h-full flex flex-col border border-border bg-card shadow-sm rounded-2xl min-h-[550px]">
                        {selectedRoom ? (
                            <>
                                {/* Room Header */}
                                <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-black flex items-center gap-2">
                                            <span>{selectedRoom.is_group ? selectedRoom.name : selectedRoom.members.map(m => m.username).join(" ↔ ")}</span>
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full border border-border">
                                                {selectedRoom.is_group ? "Group Room" : "Direct Message"}
                                            </span>
                                        </CardTitle>
                                        <CardDescription className="text-[10px] text-muted-foreground mt-1">
                                            Room ID: <span className="font-mono">{selectedRoom.id}</span> • Started {selectedRoom.created_at}
                                        </CardDescription>
                                    </div>

                                    {!adminCryptoKey && (
                                        <button
                                            onClick={() => setIsKeyModalOpen(true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all"
                                        >
                                            <Unlock className="h-3.5 w-3.5" />
                                            <span>Unlock Decryption</span>
                                        </button>
                                    )}
                                </CardHeader>

                                {/* Message Stream */}
                                <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-320px)] bg-muted/5">
                                    {loadingMessages ? (
                                        <div className="flex flex-col items-center justify-center py-20">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                            <p className="text-xs text-muted-foreground">Loading message history...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-20 text-muted-foreground text-xs font-medium">
                                            No messages logged in this conversation.
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const decrypted = decryptedContents[msg.id] || msg.content || "";
                                            const isRawOpen = !!showRawDetails[msg.id];
                                            const msgDate = new Date(msg.created_at).toLocaleString();

                                            return (
                                                <div key={msg.id} className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs font-black text-primary">
                                                                @{msg.sender?.username || msg.sender_id.substring(0, 8)}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                                {msgDate}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            {msg.is_encrypted && (
                                                                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                                    <Lock className="h-2.5 w-2.5" />
                                                                    <span>E2EE Encrypted</span>
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => setShowRawDetails(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                                                className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-muted transition-all"
                                                            >
                                                                {isRawOpen ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                                <span>{isRawOpen ? "Hide Raw" : "Raw Envelope"}</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Plaintext / Decrypted Content */}
                                                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground font-medium leading-relaxed">
                                                        {adminCryptoKey || !msg.is_encrypted ? (
                                                            <p className="whitespace-pre-wrap break-words">{decrypted}</p>
                                                        ) : (
                                                            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                                                                <Lock className="h-4 w-4 shrink-0" />
                                                                <span>Payload is encrypted. Enter the Admin Master Key above to audit plaintext.</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Raw Cryptographic Inspector */}
                                                    {isRawOpen && (
                                                        <div className="p-3 rounded-xl bg-black/90 text-emerald-400 font-mono text-[10px] space-y-1.5 overflow-x-auto border border-emerald-500/30">
                                                            <p className="font-bold text-white mb-1">// Cryptographic Verification Payload</p>
                                                            <p><span className="text-zinc-500">ID:</span> {msg.id}</p>
                                                            <p><span className="text-zinc-500">Sender:</span> {msg.sender_id}</p>
                                                            <p><span className="text-zinc-500">Ciphertext:</span> {msg.ciphertext || "N/A"}</p>
                                                            <p><span className="text-zinc-500">IV:</span> {msg.iv || "N/A"}</p>
                                                            <p className="text-wrap break-all"><span className="text-zinc-500">Envelopes:</span> {typeof msg.envelopes === "string" ? msg.envelopes : JSON.stringify(msg.envelopes)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </CardContent>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
                                    <MessageSquare className="h-8 w-8" />
                                </div>
                                <h3 className="text-sm font-black text-foreground">Select a Chat Conversation</h3>
                                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                                    Select any user direct message or group conversation from the list to inspect encrypted logs and audit message contents.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Master Key Input Modal */}
            {isKeyModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-foreground">Admin Master Escrow Key</h3>
                                <p className="text-xs text-muted-foreground">RSA-OAEP 2048/4096-bit Private Key (PKCS#8 PEM)</p>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Your private key is loaded strictly into browser session memory to decrypt the <code className="text-primary font-mono text-[11px]">admin</code> key envelope client-side. It is never transmitted across the network or stored in database logs.
                        </p>

                        <form onSubmit={handleSaveAdminKey} className="space-y-4">
                            <textarea
                                value={adminKeyPEM}
                                onChange={(e) => setAdminKeyPEM(e.target.value)}
                                placeholder="-----BEGIN PRIVATE KEY-----&#10;MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...&#10;-----END PRIVATE KEY-----"
                                rows={8}
                                className="w-full p-3 font-mono text-[11px] bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                                required
                            />

                            <div className="flex items-center justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsKeyModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-black rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 shadow-md transition-all"
                                >
                                    Activate Escrow Decryption
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
