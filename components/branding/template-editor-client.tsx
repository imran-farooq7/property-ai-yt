'use client';

import { useState } from 'react';
import { updateBrandKitAction } from '@/lib/branding-actions';
import { TEMPLATES } from '@/lib/pdf/template-engine';

interface PropertyOption {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    price: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    sqft?: number | null;
    propertyType: string;
    heroImage?: string | null;
    description?: string | null;
    amenities?: string[];
}

interface BrandKitData {
    name: string;
    logo: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    accentColor: string | null;
    fontFamily: string | null;
    tagline: string | null;
    disclaimer: string | null;
}

interface TemplateEditorClientProps {
    orgId: string;
    orgName: string;
    brandKit: BrandKitData;
    properties: PropertyOption[];
    canEdit: boolean;
    initialTemplateId?: string;
}

const COLOR_PRESETS = [
    { name: 'Royal Blue', primary: '#2563EB', secondary: '#1E40AF', accent: '#F59E0B' },
    { name: 'Midnight Navy', primary: '#0F172A', secondary: '#1E293B', accent: '#D97706' },
    { name: 'Emerald Green', primary: '#059669', secondary: '#065F46', accent: '#10B981' },
    { name: 'Modern Violet', primary: '#7C3AED', secondary: '#5B21B6', accent: '#A78BFA' },
    { name: 'Luxury Burgundy', primary: '#881337', secondary: '#4C0519', accent: '#FB7185' },
    { name: 'Sleek Slate', primary: '#334155', secondary: '#0F172A', accent: '#38BDF8' },
];

const FONT_OPTIONS = [
    { id: 'Inter', name: 'Inter (Clean & Modern Sans-Serif)', sample: 'Contemporary clean geometry' },
    { id: 'Playfair Display', name: 'Playfair Display (Luxury Editorial Serif)', sample: 'Timeless luxury and prestige' },
    { id: 'Montserrat', name: 'Montserrat (Bold Architectural Sans)', sample: 'High-impact geometric headers' },
    { id: 'Merriweather', name: 'Merriweather (Warm Editorial Serif)', sample: 'Inviting, authoritative storytelling' },
    { id: 'Roboto', name: 'Roboto (Balanced Corporate Sans)', sample: 'Clear, modern readability' },
];

export function TemplateEditorClient({
    orgId,
    orgName,
    brandKit,
    properties,
    canEdit,
    initialTemplateId,
}: TemplateEditorClientProps) {
    const [activeTab, setActiveTab] = useState<'templates' | 'brandkit'>('templates');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || 'modern-minimal');

    // Brand Kit local state for instant live preview
    const [primaryColor, setPrimaryColor] = useState(brandKit.primaryColor || '#2563EB');
    const [secondaryColor, setSecondaryColor] = useState(brandKit.secondaryColor || '#1E40AF');
    const [accentColor, setAccentColor] = useState(brandKit.accentColor || '#F59E0B');
    const [fontFamily, setFontFamily] = useState(brandKit.fontFamily || 'Inter');
    const [logoUrl, setLogoUrl] = useState(brandKit.logo || '');
    const [tagline, setTagline] = useState(brandKit.tagline || 'Excellence in Residential Marketing');
    const [disclaimer, setDisclaimer] = useState(
        brandKit.disclaimer || 'Information deemed reliable but not guaranteed. Equal Housing Opportunity.'
    );

    // Property selection for preview
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
        properties.length > 0 ? properties[0].id : 'sample'
    );

    const activeProperty: PropertyOption =
        properties.find((p) => p.id === selectedPropertyId) || {
            id: 'sample',
            title: 'Waterfront Sunset Villa & Gardens',
            address: '1400 Ocean Boulevard',
            city: 'Miami Beach',
            state: 'FL',
            price: 1850000,
            currency: 'USD',
            bedrooms: 4,
            bathrooms: 3.5,
            sqft: 3450,
            propertyType: 'house',
            heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80',
            description:
                'A masterwork of coastal design. Floor-to-ceiling panoramic glass, bespoke Italian chef kitchen, resort infinity pool, and sunset terrace overlooking the bay.',
            amenities: ['Private Infinity Pool', 'Heated Garage', 'Wine Cellar', 'Ocean Views', 'Smart Home'],
        };

    // Render HTML preview using current template definition
    const templateDef = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];
    const previewHtml = templateDef.render(activeProperty, {
        name: brandKit.name || orgName,
        logo: logoUrl || undefined,
        primaryColor,
        secondaryColor,
        accentColor,
        fontFamily,
        tagline,
        disclaimer,
        agencyPhone: '+1 (555) 019-2834',
        agencyWebsite: 'www.propertyai.com',
    });

    return (
        <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setActiveTab('templates')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'templates'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <span>🎨</span>
                    <span>Flyer Templates & Preview</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('brandkit')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'brandkit'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <span>✨</span>
                    <span>Agency Brand Kit</span>
                </button>
            </div>

            {/* TAB 1: TEMPLATE CATALOG & LIVE PREVIEW */}
            {activeTab === 'templates' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Template Selector & Settings (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Property Selector */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-2">
                            <label htmlFor="previewProperty" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                Preview with Listing
                            </label>
                            <select
                                id="previewProperty"
                                value={selectedPropertyId}
                                onChange={(e) => setSelectedPropertyId(e.target.value)}
                                className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                            >
                                {properties.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.title} (${p.price.toLocaleString()})
                                    </option>
                                ))}
                                <option value="sample">★ Sample Luxury Listing (Demo Data)</option>
                            </select>
                        </div>

                        {/* Template Gallery */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                Select Layout Design
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {TEMPLATES.map((tpl) => {
                                    const isSelected = selectedTemplateId === tpl.id;
                                    return (
                                        <button
                                            type="button"
                                            key={tpl.id}
                                            onClick={() => setSelectedTemplateId(tpl.id)}
                                            className={`text-left rounded-xl border p-3 flex flex-col justify-between transition-all ${isSelected
                                                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                        >
                                            <div className="h-24 w-full rounded-lg overflow-hidden bg-gray-100 mb-2.5">
                                                <img src={tpl.previewThumbnail} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-xs text-gray-900">{tpl.name}</span>
                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                                                        {tpl.category}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                    {tpl.description}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Template Action Banner */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-5 shadow-sm space-y-2">
                            <div className="font-bold text-sm">Ready to produce marketing packs?</div>
                            <p className="text-xs text-blue-100">
                                This layout will be automatically branded with your colors, agency logo, and agent contact info when generating PDF reports.
                            </p>
                            <div className="pt-2">
                                <a
                                    href="/packs"
                                    className="inline-block px-4 py-2 bg-white text-blue-700 text-xs font-bold rounded-lg shadow hover:bg-blue-50 transition-colors"
                                >
                                    Generate PDF Marketing Pack &rarr;
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right: Live A4 PDF Preview Iframe (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col space-y-3">
                        <div className="flex items-center justify-between px-1 text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">Live A4 Print Preview</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px]">210mm × 297mm (Standard A4)</span>
                        </div>

                        <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 shadow-inner flex justify-center items-start overflow-hidden min-h-[680px]">
                            <div
                                className="bg-white shadow-2xl rounded-sm overflow-hidden"
                                style={{
                                    width: '595px',
                                    height: '842px',
                                    transform: 'scale(0.82)',
                                    transformOrigin: 'top center',
                                }}
                            >
                                <iframe
                                    title="PDF Preview"
                                    srcDoc={previewHtml}
                                    className="w-full h-full border-0 pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: BRAND KIT MANAGER */}
            {activeTab === 'brandkit' && (
                <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
                    <form action={updateBrandKitAction} className="space-y-8">
                        <input type="hidden" name="orgId" value={orgId} />

                        {/* Header */}
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-lg font-bold text-gray-900">Agency Visual Identity</h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Customize your real estate brokerage branding. These styles are automatically injected into all AI-generated PDF brochures, flyers, and client presentations.
                            </p>
                        </div>

                        {/* Color Palettes & Presets */}
                        <div className="space-y-4">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                1. Brand Color Palette
                            </div>

                            {/* Color Presets */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {COLOR_PRESETS.map((preset) => (
                                    <button
                                        type="button"
                                        key={preset.name}
                                        onClick={() => {
                                            setPrimaryColor(preset.primary);
                                            setSecondaryColor(preset.secondary);
                                            setAccentColor(preset.accent);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-medium transition-all"
                                    >
                                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                                        <span>{preset.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label htmlFor="primaryColor" className="block text-xs font-semibold text-gray-700 mb-1">
                                        Primary Brand Color
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            id="primaryColor"
                                            name="primaryColor"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="h-10 w-12 rounded cursor-pointer border border-gray-300 p-0.5 bg-white"
                                        />
                                        <input
                                            type="text"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-full text-xs font-mono rounded-lg border border-gray-300 p-2.5 uppercase"
                                        />
                                    </div>
                                    <span className="text-[11px] text-gray-400 mt-1 block">Used for headers, buttons, prices</span>
                                </div>

                                <div>
                                    <label htmlFor="secondaryColor" className="block text-xs font-semibold text-gray-700 mb-1">
                                        Secondary Brand Color
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            id="secondaryColor"
                                            name="secondaryColor"
                                            value={secondaryColor}
                                            onChange={(e) => setSecondaryColor(e.target.value)}
                                            className="h-10 w-12 rounded cursor-pointer border border-gray-300 p-0.5 bg-white"
                                        />
                                        <input
                                            type="text"
                                            value={secondaryColor}
                                            onChange={(e) => setSecondaryColor(e.target.value)}
                                            className="w-full text-xs font-mono rounded-lg border border-gray-300 p-2.5 uppercase"
                                        />
                                    </div>
                                    <span className="text-[11px] text-gray-400 mt-1 block">Used for dark backgrounds & strips</span>
                                </div>

                                <div>
                                    <label htmlFor="accentColor" className="block text-xs font-semibold text-gray-700 mb-1">
                                        Accent Highlight Color
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            id="accentColor"
                                            name="accentColor"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="h-10 w-12 rounded cursor-pointer border border-gray-300 p-0.5 bg-white"
                                        />
                                        <input
                                            type="text"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="w-full text-xs font-mono rounded-lg border border-gray-300 p-2.5 uppercase"
                                        />
                                    </div>
                                    <span className="text-[11px] text-gray-400 mt-1 block">Used for badges & luxury callouts</span>
                                </div>
                            </div>
                        </div>

                        {/* Typography */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                2. Typography & Fonts
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {FONT_OPTIONS.map((font) => (
                                    <label
                                        key={font.id}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between ${fontFamily === font.id
                                                ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div>
                                            <div className="font-semibold text-xs text-gray-900">{font.name}</div>
                                            <div className="text-[11px] text-gray-500 mt-0.5" style={{ fontFamily: font.id }}>
                                                {font.sample}
                                            </div>
                                        </div>
                                        <input
                                            type="radio"
                                            name="fontFamily"
                                            value={font.id}
                                            checked={fontFamily === font.id}
                                            onChange={() => setFontFamily(font.id)}
                                            className="mt-1"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Logo and Tagline */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                3. Agency Assets & Disclaimer
                            </div>

                            <div>
                                <label htmlFor="logo" className="block text-xs font-semibold text-gray-700 mb-1">
                                    Agency Logo URL (PNG with transparent background recommended)
                                </label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="url"
                                        id="logo"
                                        name="logo"
                                        value={logoUrl}
                                        onChange={(e) => setLogoUrl(e.target.value)}
                                        placeholder="https://agency.com/logo.png"
                                        className="flex-1 text-xs rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    />
                                    {logoUrl && (
                                        <div className="h-10 w-24 p-1 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                                            <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="tagline" className="block text-xs font-semibold text-gray-700 mb-1">
                                    Brokerage Tagline
                                </label>
                                <input
                                    type="text"
                                    id="tagline"
                                    name="tagline"
                                    value={tagline}
                                    onChange={(e) => setTagline(e.target.value)}
                                    placeholder="e.g. South Florida's Premier Real Estate Brokerage"
                                    className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="disclaimer" className="block text-xs font-semibold text-gray-700 mb-1">
                                    Print Disclaimer & Legal Notice
                                </label>
                                <textarea
                                    id="disclaimer"
                                    name="disclaimer"
                                    rows={2}
                                    value={disclaimer}
                                    onChange={(e) => setDisclaimer(e.target.value)}
                                    className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        {canEdit && (
                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                                >
                                    Save Brand Kit &rarr;
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
}
