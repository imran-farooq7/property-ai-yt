'use client';

import { useState, useTransition } from 'react';
import { generateAIContentAction, deleteGeneratedContentAction } from '@/lib/ai/ai-actions';
import type { ContentTone } from '@/types';
import type { AIContentType } from '@/lib/ai/generator';

interface GenerationRecord {
    id: string;
    contentType: string;
    tone: string;
    content: string;
    model: string | null;
    createdAt: Date;
}

interface AiGeneratorClientProps {
    orgId: string;
    propertyId: string;
    propertyTitle: string;
    creditsRemaining: number;
    creditLimit: number;
    initialHistory: GenerationRecord[];
}

export function AiGeneratorClient({
    orgId,
    propertyId,
    propertyTitle,
    creditsRemaining,
    creditLimit,
    initialHistory,
}: AiGeneratorClientProps) {
    const [isPending, startTransition] = useTransition();
    const [selectedTone, setSelectedTone] = useState<ContentTone>('luxury');
    const [selectedType, setSelectedType] = useState<AIContentType>('description');
    const [customInstructions, setCustomInstructions] = useState('');
    const [activeOutput, setActiveOutput] = useState<string>(
        initialHistory.length > 0 ? initialHistory[0].content : ''
    );
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const tones: Array<{ id: ContentTone; label: string; icon: string; desc: string }> = [
        { id: 'luxury', label: 'Luxury & Prestige', icon: '💎', desc: 'Sophisticated, evocative, high-end' },
        { id: 'friendly', label: 'Warm & Friendly', icon: '🏡', desc: 'Welcoming, charming, lifestyle-focused' },
        { id: 'formal', label: 'Formal & Investor', icon: '💼', desc: 'Objective, ROI, specs, facts' },
        { id: 'neutral', label: 'Balanced & Clear', icon: '⚖️', desc: 'Concise, clean, professional' },
    ];

    const contentTypes: Array<{ id: AIContentType; label: string; icon: string }> = [
        { id: 'description', label: 'Listing Description', icon: '📝' },
        { id: 'bullets', label: 'Feature Bullets', icon: '✨' },
        { id: 'headline', label: 'Catchy Headlines', icon: '🏷️' },
        { id: 'social', label: 'Social Media Pack', icon: '📱' },
        { id: 'full_pack', label: 'Complete Pack (All-in-One)', icon: '📦' },
    ];



    const wordCount = activeOutput.trim() ? activeOutput.trim().split(/\s+/).length : 0;
    const charCount = activeOutput.length;
    const handleGenerate = async (formData: FormData) => {
        startTransition(async () => {
            setErrorMessage(null)
            try {
                await generateAIContentAction(formData)
            } catch (error) {
                console.log(error)
            }
        })

    }
    const handleCopy = () => {
        if (!activeOutput) return
        navigator.clipboard.writeText(activeOutput)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Configuration Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
                <form action={handleGenerate} className="space-y-6">
                    <input type="hidden" name="orgId" value={orgId} />
                    <input type="hidden" name="propertyId" value={propertyId} />
                    <input type="hidden" name="tone" value={selectedTone} />
                    <input type="hidden" name="contentType" value={selectedType} />

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed">
                            ⚠️ {errorMessage}
                        </div>
                    )}

                    {/* Tone Selector */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                            1. Select Copy Tone
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {tones.map((t) => (
                                <button
                                    type="button"
                                    key={t.id}
                                    onClick={() => setSelectedTone(t.id)}
                                    className={`p-3 text-left rounded-lg border text-xs transition-all ${selectedTone === t.id
                                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 text-blue-900 font-semibold'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5 text-sm mb-0.5">
                                        <span>{t.icon}</span>
                                        <span>{t.label}</span>
                                    </div>
                                    <div className="text-[11px] text-gray-500 font-normal">{t.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Type Selector */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                            2. Content Asset to Generate
                        </label>
                        <div className="space-y-2">
                            {contentTypes.map((ct) => (
                                <button
                                    type="button"
                                    key={ct.id}
                                    onClick={() => setSelectedType(ct.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-medium transition-all ${selectedType === ct.id
                                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold ring-1 ring-blue-600'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{ct.icon}</span>
                                        <span>{ct.label}</span>
                                    </div>
                                    {selectedType === ct.id && <span className="text-blue-600 font-bold">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Instructions */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-2">
                        <label htmlFor="customInstructions" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                            3. Special Instructions (Optional)
                        </label>
                        <textarea
                            id="customInstructions"
                            name="customInstructions"
                            rows={2}
                            value={customInstructions}
                            onChange={(e) => setCustomInstructions(e.target.value)}
                            placeholder="e.g. Highlight sunset views from balcony, newly renovated Italian marble kitchen, or quiet cul-de-sac..."
                            className="w-full text-xs rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isPending || (creditLimit !== -1 && creditsRemaining <= 0)}
                        className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                <span>AI Copywriter is writing...</span>
                            </>
                        ) : (
                            <>
                                <span>⚡ Generate Marketing Copy</span>
                                <span className="text-xs bg-blue-500 px-2 py-0.5 rounded font-normal text-blue-100">
                                    1 Credit
                                </span>
                            </>
                        )}
                    </button>
                </form>

                {/* Previous Generations Roster */}
                {initialHistory.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Saved Generations ({initialHistory.length})
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {initialHistory.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-lg border border-gray-200 text-xs transition-colors"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setActiveOutput(item.content)}
                                        className="flex-1 text-left truncate mr-2"
                                    >
                                        <div className="font-semibold text-gray-900 capitalize truncate">
                                            {item.contentType.replace(/_/g, ' ')} • {item.tone}
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString()} at{' '}
                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </button>
                                    <form action={deleteGeneratedContentAction} className="inline-block">
                                        <input type="hidden" name="orgId" value={orgId} />
                                        <input type="hidden" name="propertyId" value={propertyId} />
                                        <input type="hidden" name="contentId" value={item.id} />
                                        <button
                                            type="submit"
                                            title="Delete"
                                            className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Live Output & Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-4 flex flex-col">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                        {/* Output Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Generated Marketing Copy</h2>
                                <p className="text-xs text-gray-500">Review, edit, or copy directly to your MLS / flyers.</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    disabled={!activeOutput}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <span>{copied ? '✓' : '📋'}</span>
                                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Editable Output Canvas */}
                        <div className="relative">
                            <textarea
                                value={activeOutput}
                                onChange={(e) => setActiveOutput(e.target.value)}
                                placeholder="Click 'Generate Marketing Copy' on the left to write compelling AI descriptions, bullet points, headlines, or social posts..."
                                rows={16}
                                className="w-full text-sm font-sans leading-relaxed text-gray-800 p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-y min-h-[380px]"
                            />
                        </div>
                    </div>

                    {/* Footer Stats & Convert Action */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500">
                        <div>
                            <span className="font-semibold text-gray-700">{wordCount}</span> words &bull;{' '}
                            <span className="font-semibold text-gray-700">{charCount}</span> characters
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href="/editor"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                            >
                                <span>🎨</span>
                                <span>Use in PDF Flyer Template &rarr;</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Feature Hint Box */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 flex items-start gap-2.5">
                    <span className="text-base mt-0.5">💡</span>
                    <div>
                        <span className="font-semibold">Pro Tip:</span> You can edit any generated sentence directly in the
                        box above before copying. All generations are automatically stored in your listing history so you
                        never lose past variations.
                    </div>
                </div>
            </div>
        </div>
    );
}
