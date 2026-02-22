/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Droplets, 
  MapPin, 
  AlertTriangle, 
  Info, 
  Navigation, 
  Waves, 
  Route, 
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Languages
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Translations ---

type Language = 'fr' | 'en';

const translations = {
  fr: {
    title: "Garonne Flood Watch",
    subtitle: "Surveillance Hydrologique en Temps Réel",
    systemOperational: "Système Opérationnel",
    propertyAssessment: "Évaluation de Propriété",
    propertyDesc: "Vérifiez si une propriété spécifique est actuellement touchée par les inondations.",
    addressPlaceholder: "Entrez l'adresse (ex: Quai de la Daurade, Toulouse)",
    checkProperty: "Vérifier la Propriété",
    roadStatus: "État des Routes",
    roadDesc: "Vérifiez si une route est ouverte ou fermée. Entrez le numéro de route et le lieu d'intérêt.",
    roadPlaceholder: "Numéro de route et lieu d'intérêt (ex: D116 Gaujac)",
    checkRoad: "Vérifier la Route",
    floodRiskDetected: "Risque d'Inondation Détecté",
    noImmediateRisk: "Aucun Risque Immédiat",
    lastVerified: "Dernière vérification",
    waterDepth: "Profondeur d'eau",
    recommendations: "Recommandations",
    dataSources: "Sources de Données",
    riskAssessmentTitle: "Évaluation des Risques de Crue",
    riskAssessmentDesc: "Entrez un lieu ou un numéro de route pour recevoir l'état hydrologique actuel et des conseils de sécurité.",
    noAssessmentActive: "Aucune Évaluation Active",
    noAssessmentDesc: "Entrez une adresse ou un numéro de route ci-dessus pour commencer votre évaluation des risques de crue.",
    basinOverview: "Aperçu du Bassin",
    basinDesc: "La Garonne est actuellement sous surveillance active. La fonte des neiges saisonnière et les fortes précipitations dans les Pyrénées peuvent entraîner des changements d'élévation rapides.",
    alertLevel: "Niveau d'Alerte",
    moderate: "Jaune / Modéré",
    primaryBasin: "Bassin Principal",
    forecastTrend: "Tendance des Prévisions",
    stable: "Stable",
    emergencyContacts: "Contacts d'Urgence",
    emergencyServices: "Services d'Urgence",
    officialPortal: "Portail Officiel",
    privacyPolicy: "Politique de Confidentialité",
    termsOfService: "Conditions d'Utilisation",
    apiDoc: "Documentation API",
    refresh: "Actualiser",
    footerNote: "© {year} Initiative de Sécurité Hydrologique. Données fournies par Gemini AI et sources publiques.",
    errorFetch: "Échec de la récupération des données de crue en temps réel. Veuillez réessayer plus tard.",
    toggleLang: "English",
    stationMonitoring: "Surveillance des Stations",
    stationDesc: "Sélectionnez une station de mesure pour obtenir le niveau actuel de la rivière.",
    selectStation: "Choisir une station",
    checkLevel: "Vérifier le Niveau",
    currentLevel: "Niveau Actuel",
    stationStatus: "État de la Station",
    stations: {
      toulouse: "Toulouse (Pont Neuf)",
      verdun: "Verdun-sur-Garonne",
      agen: "Agen",
      tonneins: "Tonneins",
      marmande: "Marmande",
      lareole: "La Réole",
      bordeaux: "Bordeaux (Marégraphe)"
    }
  },
  en: {
    title: "Garonne Flood Watch",
    subtitle: "Real-time Hydrological Monitoring",
    systemOperational: "System Operational",
    propertyAssessment: "Property Assessment",
    propertyDesc: "Check if a specific property is currently affected by flooding.",
    addressPlaceholder: "Enter address (e.g., Quai de la Daurade, Toulouse)",
    checkProperty: "Check Property",
    roadStatus: "Road Status",
    roadDesc: "Verify if a road is open or closed. Enter the road number and place of interest.",
    roadPlaceholder: "Road number and place of interest (e.g., D116 Gaujac)",
    checkRoad: "Check Road",
    floodRiskDetected: "Flood Risk Detected",
    noImmediateRisk: "No Immediate Risk",
    lastVerified: "Last verified",
    waterDepth: "Water Depth",
    recommendations: "Recommendations",
    dataSources: "Data Sources",
    riskAssessmentTitle: "Flood Risk Assessment",
    riskAssessmentDesc: "Enter a location or road number to receive current hydrological status and safety guidance.",
    noAssessmentActive: "No Assessment Active",
    noAssessmentDesc: "Enter an address or road number above to begin your flood risk assessment.",
    basinOverview: "Basin Overview",
    basinDesc: "The Garonne River is currently under active monitoring. Seasonal snowmelt and heavy precipitation in the Pyrenees can lead to rapid elevation changes.",
    alertLevel: "Alert Level",
    moderate: "Yellow / Moderate",
    primaryBasin: "Primary Basin",
    forecastTrend: "Forecast Trend",
    stable: "Stable",
    emergencyContacts: "Emergency Contacts",
    emergencyServices: "Emergency Services",
    officialPortal: "Official Portal",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    apiDoc: "API Documentation",
    refresh: "Refresh",
    footerNote: "© {year} Hydrological Safety Initiative. Data provided by Gemini AI & Public Sources.",
    errorFetch: "Failed to fetch real-time flood data. Please try again later.",
    toggleLang: "Français",
    stationMonitoring: "Station Monitoring",
    stationDesc: "Select a monitoring station to get the current river level.",
    selectStation: "Select a station",
    checkLevel: "Check Level",
    currentLevel: "Current Level",
    stationStatus: "Station Status",
    stations: {
      toulouse: "Toulouse (Pont Neuf)",
      verdun: "Verdun-sur-Garonne",
      agen: "Agen",
      tonneins: "Tonneins",
      marmande: "Marmande",
      lareole: "La Réole",
      bordeaux: "Bordeaux (Tide Gauge)"
    }
  }
};

// --- Types ---

interface FloodStatus {
  isFlooded: boolean;
  alertLevel: 'green' | 'yellow' | 'orange' | 'red';
  waterDepth?: string;
  roadStatus?: string;
  lastUpdated: string;
  summary: string;
  recommendations: string[];
  sources: { title: string; url: string }[];
  riverLevel?: string;
  stationName?: string;
  historicalData?: { date: string; time: string; level: number }[];
  predictionData?: { date: string; time: string; level: number }[];
}

// --- Components ---

const Header = ({ 
  lang, 
  onToggleLang 
}: { 
  lang: Language, 
  onToggleLang: () => void 
}) => {
  const t = translations[lang];
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Waves size={24} />
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 leading-none">{t.title}</h1>
            <p className="text-xs text-zinc-500 mt-1">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleLang}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full text-xs font-medium border border-zinc-200 transition-colors"
          >
            <Languages size={14} />
            {t.toggleLang}
          </button>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            {t.systemOperational}
          </div>
        </div>
      </div>
    </header>
  );
};

const SearchSection = ({ 
  onSearch, 
  onStationSearch,
  isLoading,
  lang
}: { 
  onSearch: (type: 'address' | 'road', value: string) => void,
  onStationSearch: (station: string) => void,
  isLoading: boolean,
  lang: Language
}) => {
  const [address, setAddress] = useState('');
  const [road, setRoad] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const t = translations[lang];

  const stationList = Object.entries(t.stations);

  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-yellow-500 p-6 rounded-2xl border border-yellow-600 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-black" size={20} />
            <h2 className="font-bold text-black">{t.propertyAssessment}</h2>
          </div>
          <p className="text-sm text-black/60 mb-4">{t.propertyDesc}</p>
          <div className="relative">
            <input
              type="text"
              placeholder={t.addressPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-yellow-400 border border-yellow-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm placeholder:text-black/40 text-black"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && address && onSearch('address', address)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={18} />
          </div>
          <button
            disabled={isLoading || !address}
            onClick={() => onSearch('address', address)}
            className="w-full mt-4 bg-black hover:bg-zinc-900 disabled:bg-black/20 text-yellow-400 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : t.checkProperty}
          </button>
        </div>

        <div className="bg-yellow-500 p-6 rounded-2xl border border-yellow-600 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <Route className="text-black" size={20} />
            <h2 className="font-bold text-black">{t.roadStatus}</h2>
          </div>
          <p className="text-sm text-black/60 mb-4">{t.roadDesc}</p>
          <div className="relative">
            <input
              type="text"
              placeholder={t.roadPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-yellow-400 border border-yellow-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm placeholder:text-black/40 text-black"
              value={road}
              onChange={(e) => setRoad(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && road && onSearch('road', road)}
            />
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={18} />
          </div>
          <button
            disabled={isLoading || !road}
            onClick={() => onSearch('road', road)}
            className="w-full mt-4 bg-black hover:bg-zinc-900 disabled:bg-black/20 text-yellow-400 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : t.checkRoad}
          </button>
        </div>
      </div>

      <div className="bg-yellow-500 p-6 rounded-2xl border border-yellow-600 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <Droplets className="text-black" size={20} />
          <h2 className="font-bold text-black">{t.stationMonitoring}</h2>
        </div>
        <p className="text-sm text-black/60 mb-4">{t.stationDesc}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="flex-1 px-4 py-3 bg-yellow-400 border border-yellow-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm appearance-none text-black"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
          >
            <option value="">{t.selectStation}</option>
            {stationList.map(([key, name]) => (
              <option key={key} value={name}>{name}</option>
            ))}
          </select>
          <button
            disabled={isLoading || !selectedStation}
            onClick={() => onStationSearch(selectedStation)}
            className="px-8 bg-black hover:bg-zinc-900 disabled:bg-black/20 text-yellow-400 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : t.checkLevel}
          </button>
        </div>
      </div>
    </div>
  );
};

const RiverLevelChart = ({ 
  historicalData = [], 
  predictionData = [], 
  lang,
  stationName
}: { 
  historicalData?: { date: string; time: string; level: number }[]; 
  predictionData?: { date: string; time: string; level: number }[];
  lang: Language;
  stationName?: string;
}) => {
  const [timeRange, setTimeRange] = useState<'1d' | '5d' | '10d' | '30d'>('1d');
  
  // Filter historical data based on selected time range
  const getFilteredHistoricalData = () => {
    if (historicalData.length === 0) return [];
    
    // The AI provides ~54 points: 24 hourly + 30 daily.
    // We want to show a meaningful subset based on timeRange.
    switch (timeRange) {
      case '1d': 
        return historicalData.slice(-24);
      case '5d': 
        // Last 24h (24 pts) + 4 days before (4 pts) = 28 pts
        return historicalData.slice(-28);
      case '10d': 
        // Last 24h (24 pts) + 9 days before (9 pts) = 33 pts
        return historicalData.slice(-33);
      case '30d': 
        return historicalData;
      default: 
        return historicalData;
    }
  };

  const filteredHistorical = getFilteredHistoricalData();
  
  const combinedData = [
    ...filteredHistorical.map((d, i) => ({ 
      ...d, 
      type: 'historical',
      fullTime: `hist-${d.date}-${d.time}-${i}`,
      displayTime: d.time,
      historicalLevel: typeof d.level === 'number' ? d.level : parseFloat(d.level as any),
      predictionLevel: (i === filteredHistorical.length - 1 && predictionData.length > 0) ? (typeof d.level === 'number' ? d.level : parseFloat(d.level as any)) : undefined
    })),
    ...predictionData.map((d, i) => ({ 
      ...d, 
      type: 'prediction', 
      fullTime: `pred-${d.date}-${d.time}-${i}`,
      displayTime: d.time,
      predictionLevel: typeof d.level === 'number' ? d.level : parseFloat(d.level as any)
    }))
  ].filter(d => typeof d.level === 'number' && !isNaN(d.level));

  if (combinedData.length === 0) {
    return (
      <div className="bg-[#0a192f] rounded-2xl border border-blue-900/50 p-8 text-center mt-6">
        <Droplets className="mx-auto text-blue-900 mb-3" size={32} />
        <p className="text-blue-300/60 text-sm font-bold uppercase tracking-widest">
          {lang === 'fr' ? "Données graphiques non disponibles" : "Chart data not available"}
        </p>
      </div>
    );
  }

  // Calculate dynamic Y-axis domain with padding
  const validLevels = combinedData.map(d => d.level).filter(l => typeof l === 'number' && !isNaN(l));
  const minL = validLevels.length > 0 ? Math.min(...validLevels) : 0;
  const maxL = validLevels.length > 0 ? Math.max(...validLevels) : 10;
  const padding = (maxL - minL) * 0.2 || 0.5;
  const yDomain = [Math.max(0, minL - padding), maxL + padding];

  return (
    <div className="bg-[#0a192f] rounded-2xl border border-blue-900/50 p-6 shadow-xl mt-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h4 className="font-bold text-white flex items-center gap-2">
            <Droplets className="text-yellow-400" size={18} />
            <span className="text-yellow-400">
              {stationName ? `${stationName} - ` : ""}
              {lang === 'fr' ? "Évolution du Niveau" : "Level Evolution"}
            </span>
          </h4>
          <p className="text-[10px] text-blue-300/60 font-bold uppercase tracking-wider mt-1">
            {lang === 'fr' ? "Prévision à 6h" : "6h Look Ahead"}
          </p>
        </div>
        <div className="flex bg-blue-900/30 p-1 rounded-lg">
          {(['1d', '5d', '10d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                timeRange === range 
                  ? "bg-yellow-400 text-[#0a192f] shadow-sm" 
                  : "text-blue-200 hover:text-white"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={combinedData}>
            <defs>
              <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="fullTime" 
              height={0}
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              unit="m"
              domain={yDomain}
              allowDataOverflow={true}
              tickFormatter={(val) => val.toFixed(1)}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0f172a] border border-1e293b p-3 rounded-xl shadow-2xl">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                        {data.date} @ {data.time}
                      </p>
                      <p className="text-lg font-black text-yellow-400">
                        {data.level}m
                      </p>
                      <p className="text-[9px] text-zinc-500 italic">
                        {data.type === 'historical' ? (lang === 'fr' ? 'Historique' : 'Historical') : (lang === 'fr' ? 'Prévision' : 'Forecast')}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="historicalLevel" 
              stroke="#fbbf24" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorLevel)" 
              name={lang === 'fr' ? "Niveau Historique (m)" : "Historical Level (m)"}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#fbbf24' }}
              connectNulls
              isAnimationActive={false}
            />
            <Area 
              type="monotone" 
              dataKey="predictionLevel" 
              stroke="#ffffff" 
              strokeWidth={3}
              strokeDasharray="5 5"
              fillOpacity={1} 
              fill="url(#colorPred)" 
              name={lang === 'fr' ? "Prévision (m)" : "Forecast (m)"}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#ffffff' }}
              connectNulls
              isAnimationActive={false}
            />
            {predictionData.length > 0 && combinedData.some(d => d.type === 'prediction') && (
              <ReferenceLine 
                x={combinedData.find(d => d.type === 'prediction')?.fullTime} 
                stroke="#94a3b8" 
                strokeDasharray="3 3" 
                label={{ position: 'top', value: lang === 'fr' ? 'Prévision' : 'Forecast', fontSize: 10, fill: '#94a3b8' }} 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-blue-300/60">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          {lang === 'fr' ? "Historique" : "Historical"}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-white rounded-full" />
          {lang === 'fr' ? "Prévision (6h)" : "Forecast (6h)"}
        </div>
      </div>
    </div>
  );
};

const ResultCard = ({ status, lang, onRefresh, isLoading }: { status: FloodStatus, lang: Language, onRefresh: () => void, isLoading: boolean }) => {
  const t = translations[lang];
  const isStationResult = !!status.stationName;

  const getAlertStyles = (level: string) => {
    switch (level) {
      case 'red': return { bg: 'bg-red-500/20', icon: 'bg-red-600', text: 'text-red-900', sub: 'text-red-800/60', badge: 'bg-red-600 text-white' };
      case 'orange': return { bg: 'bg-orange-500/20', icon: 'bg-orange-600', text: 'text-orange-900', sub: 'text-orange-800/60', badge: 'bg-orange-600 text-white' };
      case 'yellow': return { bg: 'bg-amber-500/20', icon: 'bg-amber-600', text: 'text-amber-900', sub: 'text-amber-800/60', badge: 'bg-amber-600 text-black' };
      default: return { bg: 'bg-emerald-500/20', icon: 'bg-emerald-600', text: 'text-emerald-900', sub: 'text-emerald-800/60', badge: 'bg-emerald-600 text-white' };
    }
  };

  const styles = getAlertStyles(status.alertLevel);

  return (
    <div className="bg-yellow-500 rounded-2xl border border-yellow-600 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={cn(
        "p-6 flex items-center justify-between border-b border-yellow-600",
        styles.bg
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-white",
            styles.icon
          )}>
            {status.alertLevel === 'red' || status.alertLevel === 'orange' ? <AlertTriangle size={24} /> : (isStationResult ? <Waves size={24} /> : <Droplets size={24} />)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={cn("font-bold text-lg", styles.text)}>
                {isStationResult ? status.stationName : (status.isFlooded ? t.floodRiskDetected : t.noImmediateRisk)}
              </h3>
              <div className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter", styles.badge)}>
                {status.alertLevel}
              </div>
              <button 
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/10 hover:bg-black/20 border border-black/10 rounded-xl transition-all text-black shadow-sm disabled:opacity-50"
                title={t.refresh}
              >
                <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t.refresh}</span>
              </button>
            </div>
            <p className={cn("text-xs font-bold", styles.sub)}>
              {t.lastVerified}: {status.lastUpdated}
            </p>
          </div>
        </div>
        {(status.waterDepth || status.riverLevel) && (
          <div className="text-right">
            <p className="text-xs text-black/40 uppercase font-bold tracking-wider">
              {isStationResult ? t.currentLevel : t.waterDepth}
            </p>
            <p className="text-2xl font-black text-black">{status.riverLevel || status.waterDepth}</p>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="prose prose-sm max-w-none text-black/80 mb-6">
          <Markdown>{status.summary}</Markdown>
        </div>

        {((status.historicalData && status.historicalData.length > 0) || (status.predictionData && status.predictionData.length > 0)) && (
          <RiverLevelChart 
            historicalData={status.historicalData} 
            predictionData={status.predictionData} 
            lang={lang} 
            stationName={status.stationName}
          />
        )}
        
        {status.recommendations.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-black/40 uppercase tracking-widest mb-3">{t.recommendations}</h4>
            <ul className="space-y-2">
              {status.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 text-sm text-black font-medium">
                  <ChevronRight className="text-black/40 shrink-0" size={16} />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {status.sources.length > 0 && (
          <div className="pt-6 border-t border-yellow-600">
            <h4 className="text-xs font-bold text-black/40 uppercase tracking-widest mb-3">{t.dataSources}</h4>
            <div className="flex flex-wrap gap-2">
              {status.sources.map((source, i) => (
                <a 
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/10 hover:bg-black/20 text-black rounded-full text-xs font-bold transition-colors"
                >
                  {source.title}
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FloodStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('fr');
  const [lastSearch, setLastSearch] = useState<{ type: 'address' | 'road' | 'station', value: string } | null>(null);

  const t = translations[lang];

  const toggleLang = () => {
    setLang(prev => prev === 'fr' ? 'en' : 'fr');
  };

  const performSearch = useCallback(async (type: 'address' | 'road' | 'station', value: string) => {
    setIsLoading(true);
    setError(null);
    setLastSearch({ type, value });
    
    const maxRetries = 3;
    let retryCount = 0;

    const executeSearch = async (): Promise<void> => {
      try {
        let apiKey = process.env.GEMINI_API_KEY;
        
        // Fallback for environments where the key might be in import.meta.env
        if (!apiKey) {
          apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
        }

        if (!apiKey) {
          // If still no key, check if we should prompt for one (for paid/restricted models)
          if (typeof window !== 'undefined' && (window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
              await (window as any).aistudio.openSelectKey();
              // After opening, we can't easily wait for it, but the next attempt might work
              throw new Error(lang === 'fr' ? "Veuillez sélectionner une clé API dans le dialogue qui vient de s'ouvrir." : "Please select an API key in the dialog that just opened.");
            }
          }
          throw new Error(lang === 'fr' ? "Clé API Gemini manquante. Veuillez la configurer dans les paramètres." : "Gemini API Key is missing. Please configure it in the settings.");
        }

        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-3-flash-preview";
        
        let prompt = "";
        const sharedDataInstructions = `
             DATA REQUIREMENTS FOR CHART (from the nearest hydrological station):
             1. Provide EXACTLY 24 historical data points for the LAST 24 HOURS (one per hour, e.g., 14:00, 13:00, ...).
             2. Provide an additional 30 historical data points for the 29 DAYS PRECEDING that (one point per day, e.g., "20 Feb", "19 Feb", ...).
             3. Provide 6 prediction data points for the NEXT 6 HOURS (one per hour).
             
             CRITICAL: Ensure the data is the ABSOLUTE LATEST from Vigicrues (vigicrues.gouv.fr). 
             The values MUST be realistic and match current hydrological trends for the Garonne River.
             
             ALERT LEVELS (Vigicrues standards):
             - green: No risk.
             - yellow: Risk of flooding in non-damaging areas.
             - orange: Significant risk of flooding.
             - red: Major risk of flooding.
             
             IMPORTANT: Check the official Vigicrues thresholds for the identified station. 
             For Marmande, typically: Yellow ~4.5m, Orange ~7.0m, Red ~8.5m. 
             Adjust 'alertLevel' and 'isFlooded' based on these official thresholds.
             
             FORMATTING:
             - For historicalData and predictionData, each point MUST have 'date' (e.g., "22 Feb") and 'time' (e.g., "14:00") as SEPARATE fields.
             - historicalData: ~54 points total. The first 30 points should be DAILY (one per day for the last 30 days). The last 24 points should be HOURLY (one per hour for the last 24 hours).
             - ORDER: Oldest to Newest.
             - predictionData: 6 points, ordered from SOONEST to LATEST (one per hour for the next 6 hours).
             
             IMPORTANT: Provide all text output in ${lang === 'fr' ? 'French' : 'English'}.
             Use real-time information if available via search. Ensure the 'stationName' field contains the name of the nearest station identified.`;

        if (type === 'address') {
          prompt = `Check the current flood status for the address: "${value}" along the Garonne River in France. 
             1. Determine if the property is flooded, the estimated water depth if applicable, and provide a summary of the situation.
             2. IDENTIFY the nearest hydrological monitoring station to this address (e.g., Toulouse, Tonneins, Marmande, etc.).
             3. RETRIEVE the most recent real-time hydrological data from Vigicrues for that nearest station.
             ${sharedDataInstructions}`;
        } else if (type === 'road') {
          prompt = `Check the current status of the road or street "${value}" in the Garonne River region, France. 
             The input may include a road number, street name, and/or a specific location (e.g., "D116 Gaujac").
             1. Determine if the road is open or closed due to flooding, and provide a summary of the situation.
             2. IDENTIFY the nearest hydrological monitoring station to this location.
             3. RETRIEVE the most recent real-time hydrological data from Vigicrues for that nearest station.
             ${sharedDataInstructions}`;
        } else if (type === 'station') {
          prompt = `Search for the most recent real-time hydrological data from Vigicrues (vigicrues.gouv.fr) for the monitoring station: "${value}" on the Garonne River, France.
             Identify the current water level in meters (m), the exact time of the last measurement, and the current trend (rising, falling, or stable).
             
             CRITICAL: Ensure the data for "${value}" is the ABSOLUTE LATEST from Vigicrues.
             ${sharedDataInstructions}
             Provide a detailed summary of the hydrological situation at this specific station.
             Ensure the 'riverLevel' field contains the numerical value followed by 'm'.`;
        }

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                isFlooded: { type: "boolean" },
                alertLevel: { type: "string", enum: ["green", "yellow", "orange", "red"] },
                waterDepth: { type: "string" },
                riverLevel: { type: "string" },
                stationName: { type: "string" },
                roadStatus: { type: "string" },
                lastUpdated: { type: "string" },
                summary: { type: "string" },
                recommendations: { 
                  type: "array", 
                  items: { type: "string" } 
                },
                sources: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      url: { type: "string" }
                    }
                  }
                },
                historicalData: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string" },
                      time: { type: "string" },
                      level: { type: "number" }
                    }
                  }
                },
                predictionData: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string" },
                      time: { type: "string" },
                      level: { type: "number" }
                    }
                  }
                }
              },
              required: ["isFlooded", "alertLevel", "lastUpdated", "summary", "recommendations", "sources", "historicalData", "predictionData"]
            }
          }
        });

        const data = JSON.parse(response.text || '{}');
        setResult(data);
      } catch (err: any) {
        const errorMessage = err?.message || "";
        const isQuotaError = (typeof errorMessage === 'string' && errorMessage.includes('429')) || err?.status === 'RESOURCE_EXHAUSTED';
        
        if (isQuotaError) {
          if (retryCount < maxRetries) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000;
            console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return executeSearch();
          } else {
            throw new Error(lang === 'fr' ? "Limite de quota atteinte. Veuillez patienter un instant avant de réessayer." : "Quota limit reached. Please wait a moment before trying again.");
          }
        }
        throw err;
      }
    };

    try {
      await executeSearch();
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.errorFetch);
    } finally {
      setIsLoading(false);
    }
  }, [lang, t.errorFetch]);

  useEffect(() => {
    if (lastSearch) {
      performSearch(lastSearch.type, lastSearch.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const onStationSearch = useCallback((station: string) => {
    performSearch('station', station);
  }, [performSearch]);

  return (
    <div className="min-h-screen bg-yellow-400 font-sans text-black">
      <header className="border-b border-yellow-500 bg-yellow-500/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-yellow-400 shadow-lg shadow-yellow-600/20">
              <Waves size={24} />
            </div>
            <div>
              <h1 className="font-bold text-black leading-none">{t.title}</h1>
              <p className="text-xs text-black/70 mt-1">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 bg-black/10 hover:bg-black/20 text-black rounded-full text-xs font-medium border border-black/10 transition-colors"
            >
              <Languages size={14} />
              {t.toggleLang}
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-full text-xs font-medium border border-emerald-200">
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
              {t.systemOperational}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          
          {/* Main Content: Controls & Results */}
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-black tracking-tight text-black mb-4">
                {t.riskAssessmentTitle}
              </h2>
              <p className="text-black/70 max-w-2xl mx-auto">
                {t.riskAssessmentDesc}
              </p>
            </div>

            <SearchSection onSearch={performSearch as any} onStationSearch={onStationSearch} isLoading={isLoading} lang={lang} />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 mb-8">
                <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {result ? (
              <ResultCard 
                status={result} 
                lang={lang} 
                isLoading={isLoading}
                onRefresh={() => lastSearch && performSearch(lastSearch.type, lastSearch.value)} 
              />
            ) : !isLoading && (
              <div className="bg-yellow-500/20 border border-black/10 border-dashed p-12 rounded-2xl text-center">
                <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="text-black/30" size={32} />
                </div>
                <h3 className="font-bold text-black/40">{t.noAssessmentActive}</h3>
                <p className="text-sm text-black/40 max-w-xs mx-auto mt-1">
                  {t.noAssessmentDesc}
                </p>
              </div>
            )}
          </div>

          {/* Contextual Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black rounded-2xl p-6 text-yellow-400 shadow-xl shadow-black/20">
              <div className="flex items-center gap-2 mb-4">
                <Waves size={20} />
                <h3 className="font-bold">{t.basinOverview}</h3>
              </div>
              <p className="text-sm text-yellow-400/80 mb-4">
                {t.basinDesc}
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs border-b border-yellow-400/20 pb-2">
                  <span className="opacity-80">{t.alertLevel}</span>
                  <span className="font-bold bg-yellow-400 text-black px-2 py-0.5 rounded">{t.moderate}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-yellow-400/20 pb-2">
                  <span className="opacity-80">{t.primaryBasin}</span>
                  <span className="font-bold">Garonne Amont</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-80">{t.forecastTrend}</span>
                  <span className="font-bold">{t.stable}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500 border border-yellow-600 rounded-2xl p-6">
              <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                <Navigation size={18} className="text-black/40" />
                {t.emergencyContacts}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-black/40 uppercase tracking-wider">{t.emergencyServices}</p>
                    <p className="text-lg font-black text-black">112</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <AlertTriangle size={20} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Vigicrues France</p>
                    <p className="text-sm font-medium text-black hover:underline cursor-pointer">{t.officialPortal}</p>
                  </div>
                  <ExternalLink size={16} className="text-black/30" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-yellow-500 bg-yellow-500 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-yellow-400">
              <Waves size={18} />
            </div>
            <span className="font-bold text-black">{t.title}</span>
          </div>
          <p className="text-xs text-black/60">
            {t.footerNote.replace('{year}', new Date().getFullYear().toString())}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-black/60 hover:text-black transition-colors">{t.privacyPolicy}</a>
            <a href="#" className="text-xs text-black/60 hover:text-black transition-colors">{t.termsOfService}</a>
            <a href="#" className="text-xs text-black/60 hover:text-black transition-colors">{t.apiDoc}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
