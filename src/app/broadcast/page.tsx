"use client";

import React, { useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { 
	Send, 
	Megaphone, 
	Mail, 
	Bell, 
	Users, 
	GraduationCap, 
	Sliders,
	Eye,
	Loader2,
	FileText
} from "lucide-react";

export default function BroadcastPage() {
	const [targetType, setTargetType] = useState<"all" | "target_exam" | "selected">("all");
	const [targetExam, setTargetExam] = useState("UPSC");
	const [selectedUsersInput, setSelectedUsersInput] = useState("");
	const [channel, setChannel] = useState<"notification" | "email" | "both">("both");
	
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [postID, setPostID] = useState("");
	
	const [sending, setSending] = useState(false);
	const [previewTab, setPreviewTab] = useState<"notification" | "email">("notification");

	const exams = [
		{ value: "UPSC", label: "UPSC CSE" },
		{ value: "JEE", label: "JEE" },
		{ value: "NEET", label: "NEET" },
		{ value: "GATE", label: "GATE" },
		{ value: "CAT", label: "CAT" },
		{ value: "SSC", label: "SSC CGL" },
		{ value: "Bank", label: "Bank PO/Clerk" },
		{ value: "State PCS", label: "State PCS" },
		{ value: "Law", label: "Law (CLAT)" },
		{ value: "Other", label: "Other Exams" }
	];

	const handleSendBroadcast = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !content.trim()) {
			toast.error("Please fill in both the Title and Message content.");
			return;
		}

		setSending(true);

		// Format user list if selected target
		let userIDs: string[] = [];
		if (targetType === "selected") {
			userIDs = selectedUsersInput
				.split(/[\n,]+/)
				.map(item => item.trim())
				.filter(item => item.length > 0);

			if (userIDs.length === 0) {
				toast.error("Please enter at least one target User ID.");
				setSending(false);
				return;
			}
		}

		const payload = {
			target_type: targetType,
			target_exam: targetType === "target_exam" ? targetExam : undefined,
			user_ids: targetType === "selected" ? userIDs : undefined,
			channel,
			title: title.trim(),
			content: content.trim(),
			post_id: postID.trim() || undefined
		};

		try {
			const res = await api.post<{ message: string; count: number }>("/admin/broadcast", payload);
			toast.success(res.data?.message || "Broadcast successfully queued!");
			
			// Reset inputs on success (except target fields)
			setTitle("");
			setContent("");
			setPostID("");
		} catch (error: any) {
			toast.error(error.response?.data?.error || error.message || "Failed to trigger system broadcast.");
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="container max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
			<div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-foreground">
						<Megaphone className="w-6 h-6 text-primary animate-bounce" /> Broadcast Center
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Publish system alerts, announcement feeds, mock test launches, or bulk emails to PrepNiti users.
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				{/* Left Column: Form Controls */}
				<form onSubmit={handleSendBroadcast} className="lg:col-span-7 space-y-6">
					<Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden">
						<CardHeader className="bg-muted/30 pb-4">
							<CardTitle className="text-base font-bold flex items-center gap-2">
								<Sliders className="h-4.5 w-4.5 text-primary" /> Configuration Panel
							</CardTitle>
							<CardDescription>Determine your target audience, delivery channel, and linked resources.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5 pt-6">
							
							{/* Target Type Selection */}
							<div className="space-y-2.5">
								<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Audience</label>
								<div className="grid grid-cols-3 gap-3">
									<button
										type="button"
										onClick={() => setTargetType("all")}
										className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
											targetType === "all"
												? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
												: "border-border bg-background hover:bg-muted text-muted-foreground"
										}`}
									>
										<Users className="h-5 w-5 mb-1.5" />
										<span className="text-[11px]">All Users</span>
									</button>
									
									<button
										type="button"
										onClick={() => setTargetType("target_exam")}
										className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
											targetType === "target_exam"
												? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
												: "border-border bg-background hover:bg-muted text-muted-foreground"
										}`}
									>
										<GraduationCap className="h-5 w-5 mb-1.5" />
										<span className="text-[11px]">By Exam Group</span>
									</button>

									<button
										type="button"
										onClick={() => setTargetType("selected")}
										className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
											targetType === "selected"
												? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
												: "border-border bg-background hover:bg-muted text-muted-foreground"
										}`}
									>
										<Sliders className="h-5 w-5 mb-1.5" />
										<span className="text-[11px]">Specific IDs</span>
									</button>
								</div>
							</div>

							{/* Dynamic Targeting Fields */}
							{targetType === "target_exam" && (
								<div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
									<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Target Exam</label>
									<select
										value={targetExam}
										onChange={(e) => setTargetExam(e.target.value)}
										className="w-full bg-background border border-border focus:ring-1 focus:ring-primary focus:border-primary transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
									>
										{exams.map(exam => (
											<option key={exam.value} value={exam.value}>{exam.label}</option>
										))}
									</select>
								</div>
							)}

							{targetType === "selected" && (
								<div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
									<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target User UUIDs</label>
									<textarea
										placeholder="Paste target User IDs separated by commas or newlines..."
										value={selectedUsersInput}
										onChange={(e) => setSelectedUsersInput(e.target.value)}
										rows={3}
										className="w-full p-3 bg-background border border-border focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-xl text-xs font-medium focus:outline-none resize-y min-h-[80px]"
									/>
									<p className="text-[10px] text-muted-foreground">E.g., 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d, 85f1c97a-9a99-4d6b-b4be-cfbb7cfdd2f6</p>
								</div>
							)}

							{/* Delivery Channels */}
							<div className="space-y-2.5">
								<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Delivery Channels</label>
								<div className="grid grid-cols-3 gap-3">
									<button
										type="button"
										onClick={() => setChannel("notification")}
										className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
											channel === "notification"
												? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
												: "border-border bg-background hover:bg-muted text-muted-foreground"
										}`}
									>
										<Bell className="h-5 w-5 mb-1.5" />
										<span className="text-[11px]">In-App Bell</span>
									</button>

									<button
										type="button"
										onClick={() => setChannel("email")}
										className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
											channel === "email"
												? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
												: "border-border bg-background hover:bg-muted text-muted-foreground"
										}`}
									>
										<Mail className="h-5 w-5 mb-1.5" />
										<span className="text-[11px]">Email Only</span>
									</button>

									<button
										type="button"
										onClick={() => setChannel("both")}
										className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
											channel === "both"
												? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
												: "border-border bg-background hover:bg-muted text-muted-foreground"
										}`}
									>
										<div className="flex gap-1 mb-1.5">
											<Bell className="h-4.5 w-4.5" />
											<Mail className="h-4.5 w-4.5" />
										</div>
										<span className="text-[11px]">Both Channels</span>
									</button>
								</div>
							</div>

							{/* Linked Post ID */}
							<div className="space-y-1.5">
								<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Redirect Target Post ID (Optional)</label>
								<div className="relative">
									<FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
									<input
										type="text"
										placeholder="Paste post UUID (e.g. for mock announcements or discussions)"
										value={postID}
										onChange={(e) => setPostID(e.target.value)}
										className="w-full pl-9 pr-3 bg-background border border-border focus:ring-1 focus:ring-primary focus:border-primary transition-all h-10 rounded-xl text-xs font-semibold focus:outline-none"
									/>
								</div>
							</div>

						</CardContent>
					</Card>

					{/* Message Details */}
					<Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden">
						<CardHeader className="bg-muted/30 pb-4">
							<CardTitle className="text-base font-bold flex items-center gap-2">
								<FileText className="h-4.5 w-4.5 text-primary" /> Message Composer
							</CardTitle>
							<CardDescription>Compose the text and headers for your broadcast delivery.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 pt-6">
							<div className="space-y-1.5">
								<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Broadcast Title / Subject</label>
								<input
									type="text"
									placeholder="Announcement Title (Max 255 chars)"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
									maxLength={255}
									className="w-full px-3 bg-background border border-border focus:ring-1 focus:ring-primary focus:border-primary transition-all h-10 rounded-xl text-xs font-semibold focus:outline-none"
								/>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Broadcast Content / Body</label>
								<textarea
									placeholder="Write your broadcast content here..."
									value={content}
									onChange={(e) => setContent(e.target.value)}
									required
									rows={6}
									className="w-full p-3 bg-background border border-border focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-xl text-xs font-medium focus:outline-none resize-y min-h-[120px] leading-relaxed"
								/>
							</div>

							<button
								type="submit"
								disabled={sending}
								className="w-full font-bold h-10 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] mt-2 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
							>
								{sending ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Dispatching Broadcast...
									</>
								) : (
									<>
										<Send className="h-4 w-4" /> Send Broadcast
									</>
								)}
							</button>
						</CardContent>
					</Card>
				</form>

				{/* Right Column: Live Previews */}
				<div className="lg:col-span-5 space-y-6 sticky top-4">
					<Card className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden h-full flex flex-col">
						<CardHeader className="bg-muted/30 pb-3 flex flex-row items-center justify-between">
							<div>
								<CardTitle className="text-base font-bold flex items-center gap-2">
									<Eye className="h-4.5 w-4.5 text-primary" /> Live Preview
								</CardTitle>
								<CardDescription>Visual mock representation on delivery channels.</CardDescription>
							</div>
							<div className="flex bg-muted/65 p-0.5 rounded-lg border border-border">
								<button
									type="button"
									onClick={() => setPreviewTab("notification")}
									className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
										previewTab === "notification"
											? "bg-background text-primary shadow-sm"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									In-App
								</button>
								<button
									type="button"
									onClick={() => setPreviewTab("email")}
									className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
										previewTab === "email"
											? "bg-background text-primary shadow-sm"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									Email
								</button>
							</div>
						</CardHeader>
						
						<CardContent className="p-6 flex-1 bg-muted/10 min-h-[300px]">
							{previewTab === "notification" ? (
								<div className="space-y-4">
									<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Candidate Portal Notification Dropdown Card</p>
									<div className="border border-primary/20 bg-card p-3.5 rounded-2xl shadow-sm border-l-[3px] border-l-primary flex gap-3 items-start w-full">
										<div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
											AD
										</div>
										<div className="flex-1 space-y-1 overflow-hidden">
											<p className="text-xs font-bold text-left text-primary leading-tight">
												📢 [Broadcast] {title || "System Announcement Title"}
											</p>
											<p className="text-[11px] text-muted-foreground text-left leading-normal whitespace-pre-line">
												{content || "Announcement text content composed inside the editor will render here dynamically..."}
											</p>
											<p className="text-[9px] text-muted-foreground text-left mt-1.5">
												Just now
											</p>
										</div>
										<div className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />
									</div>
								</div>
							) : (
								<div className="space-y-4">
									<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Responsive HTML Email Template Render</p>
									
									<div className="border border-border/80 bg-white rounded-xl overflow-hidden shadow-sm max-w-md mx-auto text-left text-xs font-sans text-foreground">
										{/* Brand Header Accent Bar */}
										<div className="h-1.5 bg-gradient-to-r from-orange-500 to-emerald-800" />
										
										{/* Brand Header */}
										<div className="p-5 pb-3">
											<span className="font-extrabold text-emerald-800 text-lg">PrepNiti<span className="text-orange-500">.</span></span>
										</div>
										
										{/* Main Content */}
										<div className="px-5 pb-6 space-y-3">
											<h1 className="text-sm font-bold text-emerald-950 leading-snug">{title || "Broadcast Subject / Title"}</h1>
											<p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">
												{content || "Detailed announcement content will display here, formatted inside our email wrapper."}
											</p>

											{postID && (
												<div className="pt-2">
													<div className="inline-block px-4 py-2 bg-emerald-800 text-white font-bold text-[10px] rounded-lg cursor-pointer">
														View Discussion Post
													</div>
												</div>
											)}
										</div>

										{/* Footer */}
										<div className="bg-gray-50 border-t border-gray-100 p-4 text-center text-[9px] text-gray-400">
											&copy; 2026 PrepNiti. Built by aspirants, for aspirants.
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
