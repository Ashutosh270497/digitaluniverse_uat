import { BarChart3, Cpu, Settings2, Target, TrendingUp } from 'lucide-react';

const capabilities = [
  { label: 'Automate', Icon: Settings2, position: 'ai-node-automate' },
  { label: 'Analyze', Icon: BarChart3, position: 'ai-node-analyze' },
  { label: 'Optimize', Icon: Target, position: 'ai-node-optimize' },
  { label: 'Scale', Icon: TrendingUp, position: 'ai-node-scale' },
];

const AICapabilitiesVisual = () => (
  <div className="ai-capabilities-visual" aria-hidden="true">
    <svg viewBox="0 0 600 500" className="ai-circuit-svg" fill="none">
      <defs>
        <radialGradient id="ai-core-aura"><stop stopColor="#ffd400" stopOpacity="0.28" /><stop offset="1" stopColor="#ffd400" stopOpacity="0" /></radialGradient>
        <linearGradient id="ai-circuit-line" x1="100" y1="80" x2="470" y2="450" gradientUnits="userSpaceOnUse"><stop stopColor="#fff1a1" /><stop offset="0.5" stopColor="#ffd400" /><stop offset="1" stopColor="#9c7c00" /></linearGradient>
        <pattern id="ai-grid-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#ffe45c" opacity="0.15" /></pattern>
        <filter id="ai-line-glow"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <rect width="600" height="500" fill="url(#ai-grid-dots)" />
      <circle cx="300" cy="240" r="215" fill="url(#ai-core-aura)" />
      <g stroke="url(#ai-circuit-line)">
        <ellipse cx="300" cy="410" rx="210" ry="42" opacity="0.2" />
        <ellipse cx="300" cy="410" rx="163" ry="31" opacity="0.45" />
        <ellipse cx="300" cy="410" rx="108" ry="20" opacity="0.75" />
        <path d="M225 380V339L187 319V278L163 264L188 224V171C188 115 238 83 300 83C368 83 415 125 415 189C415 238 398 267 366 294V380" strokeWidth="2" opacity="0.75" />
        <path d="M240 365V312L217 299V265M260 385V294M282 387V311L303 289M326 386V300L354 274V234M348 382V318L382 281V213" strokeWidth="2" opacity="0.6" />
        <path d="M195 240H143L111 154M405 240H457L489 154M195 274H142L111 337M405 274H457L489 337" strokeDasharray="4 7" strokeWidth="2" opacity="0.6" />
        <circle cx="300" cy="232" r="109" opacity="0.25" strokeDasharray="3 9" />
        <circle cx="300" cy="232" r="92" strokeWidth="1.5" opacity="0.8" />
        <circle cx="300" cy="232" r="75" strokeWidth="5" opacity="0.45" filter="url(#ai-line-glow)" />
      </g>
      <g fill="#ffe56e"><circle cx="225" cy="380" r="3" /><circle cx="260" cy="385" r="3" /><circle cx="282" cy="387" r="3" /><circle cx="326" cy="386" r="3" /><circle cx="348" cy="382" r="3" /><circle cx="366" cy="380" r="3" /></g>
    </svg>
    <div className="ai-core"><Cpu className="h-6 w-6" /><span>AI</span><span className="ai-core-caption">Built for your business</span></div>
    {capabilities.map(capability => {
      const { label, Icon, position } = capability;
      return <div key={label} className={`ai-capability-node ${position}`}><span><Icon /></span><p>{label}</p></div>;
    })}
  </div>
);

export default AICapabilitiesVisual;
