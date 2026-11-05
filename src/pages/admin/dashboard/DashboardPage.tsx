import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode
} from "react";

import {
  Activity,
  AlertCircle,
  BarChatrt3,
  Clock,
  Info,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Timer,
  TrendingDown,
  TrendingUp,
  Zap
} from "lucide-react";

import {
  SimpleLineChart,
  type ChartThreshold,
  type ChartXAxisMode,
  type ChartYAxisType,
  type TrendSeries
} from "@/components/admin/SimpleLineChart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getDashboardOverview,
  getDashboardPerformance,
  getDashboardTrends,
  type DashboardOverview,
  type DashboardPerformance,
  type DashboardTrends
} from "@/services/dashboardService";

type DashboardTimeWindow = "24h" | "7d" | "30d";

type DashboardTrendBundle = {
  sessions: DashboardTrends | null;
  messages: DashboardTrends | null;
  activeUsers: DashboardTrends | null;
  latency: DashboardTrends | null;
  quality: DashboardTrends | null;
};

type HealthStatus = "healthy" | "attention" | "critical" | "unknown";
type MetricTone = "good" | "warning" | "critical";

type MetricStatusView = {
  success: MetricTone;
  latency: MetricTone;
  error: MetricTone;
  noDoc: MetricTone;
};

type KPIChange = {
  value: number;
  trend: "up" | "down" | "flat";
  isPositive: boolean;
};

type InsightCardData = {
  type: "anomaly" | "trend" | "recommendation";
  severity: "info" | "warning" | "critical";
  title: string;
  metric: string;
  change: string;
  context: string;
  action?: string;
  timestamp: string;
};

const WINDOW_OPTIONS: Array<{ value: DashboardTimeWindow; label: string }> = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" }
];

const WINDOW_LABEL_MAP: Record<DashboardTimeWindow, string> = {
  "24h": "Last 24h",
  "7d": "Last 7d",
  "30d": "Last 30d"
};

const DASHBOARD_THRESHOLDS = {
  latency: { good: 10000, warning: 15000 },
  successRate: { good: 99, warning: 95 },
  errorRate: { good: 1, warning: 5 },
  noDocRate: { good: 10, warning: 30 }
} as const;

const EMPTY_TRENDS: DashboardTrendBundle = {
  sessions: null,
  messages: null,
  activeUsers: null,
  latency: null,
  quality: null
};

// -- utils
const getMetricStatus = (
  metric: "latency" | "successRate" | "errorRate" | "noDocRate",
  value?: number | null
): MetricTone => {
  if (value === null || value === undefined) return "warning";

  if (metric === "latency") {
    if (value < DASHBOARD_THRESHOLDS.latency.good) return "good";
    if (value < DASHBOARD_THRESHOLDS.latency.warning) return "warning";
    return "bad";
  }

  if (metric === "successRate") {
    if (value >= DASHBOARD_THRESHOLDS.successRate.good) return "good";
    if (value >= DASHBOARD_THRESHOLDS.successRate.warning) return "warning";
    return "bad";
  }

  if (metric === "errorRate") {
    if (value <= DASHBOARD_THRESHOLDS.errorRate.good) return "good";
    if (value <= DASHBOARD_THRESHOLDS.errorRate.warning) return "warning";
    return "bad";
  }

  if (value <= DASHBOARD_THRESHOLDS.noDocRate.good) return "good";
  if (value <= DASHBOARD_THRESHOLDS.noDocRate.warning) return "warning";
  return "bad";
};

const getHealthStatus = (
  performance?: {
    successRate?: number | null;
    errorRate?: number | null;
    noDocRate?: number | null;
  } | null,
  windowMessages?: number
): HealthStatus => {
  if (!performance || !windowMessages) return "unknown";
  if ((performance.errorRate ?? 0) > DASHBOARD_THRESHOLDS.errorRate.warning) return "critical";
  if ((performance.successRate ?? 0) < DASHBOARD_THRESHOLDS.successRate.warning) return "critical";
  if ((performance.noDocRate ?? 0) > 20) return "attention";
  return "healthy";
};

const getLatencyStatus = (value?: number | null): MetricTone => {
  if (value === null || value === undefined) return "warning";
  if (value <= DASHBOARD_THRESHOLDS.latency.good) return "good";
  if (value <= DASHBOARD_THRESHOLDS.latency.warning) return "warning";
  return "bad";
};

const formatLastUpdated = (timestamp: number | null) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
};

const formatTime = (timestamp: number | null) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
};

const formatPercent = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(1)}%`;
};

const formatDuration = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  if (value < 1000) return `${Math.round(value)}ms`;
  return `${(value / 1000).toFixed(2)}s`;
};

const formatNumber = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("zh-CN");
};

const clampPercent = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

const formatRatio = (value?: number | null) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";
  return value.toFixed(2);
};

const formatCompactNumber = (value: number): string => {
  if (value >= 10000) return `${(value / 1000).toFixed(0)}k`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return Math.round(value).toString();
};

// hooks
const useDashboardData = () => {
  const [timeWindow, setTimeWindow] = useState<DashboardTimeWindow>("24h");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [performance, setPerformance] = useState<DashboardPerformance | null>(null);
  const [trends, setTrends] = useState<DashboardTrendBundle>(EMPTY_TRENDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const requestIdRef = useRef(0);

  const loadData = useCallback(async (windowValue: DashboardTimeWindow) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const granularity = windowValue === "24h" ? "hour" : "day";

    try {
      const [overviewData, performanceData] = await Promise.all([
        getDashboardOverview(windowValue),
        getDashboardPerformance(windowValue)
      ]);
      if (requestIdRef.current !== requestId) return;
      setOverview(overviewData);
      setPerformance(performanceData);
      setLastUpdated(Date.now());

      try {
        const [sessions, messages, activeUsers, latency, quality] = await Promise.all([
          getDashboardTrends("sessions", windowValue, granularity),
          getDashboardTrends("messages", windowValue, granularity),
          getDashboardTrends("activeUsers", windowValue, granularity),
          getDashboardTrends("avgLatency", windowValue, granularity),
          getDashboardTrends("quality", windowValue, granularity)
        ]);
        if (requestIdRef.current !== requestId) return;
        setTrends({ sessions, messages, activeUsers, latency, quality });
      } catch (trendErr) {
        if (requestIdRef.current !== requestId) return;
        console.error(trendErr);
        setTrends(EMPTY_TRENDS);
        setError("趋势数据加载失败");
      }
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      console.error(err);
      setError("数据加载失败");
    } finally {
      if (requestIdRef.current !== requestId) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(timeWindow);
  }, [loadData, timeWindow]);

  const refresh = useCallback(async () => {
    await loadData(timeWindow);
  }, [loadData, timeWindow]);

  return {
    timeWindow,
    setTimeWindow,
    loading,
    error,
    lastUpdated,
    overview,
    performance,
    trends,
    refresh
  };
};

const useHealthStatus = (
  performance: DashboardPerformance | null,
  overview: DashboardOverview | null
) => {
  const windowMessages = overview?.kpis?.messages24h?.value;
  const health = useMemo(
    () => getHealthStatus(performance, windowMessages),
    [performance, windowMessages]
  );

  const metricStatus = useMemo<MetricStatusView>(
    () => ({
      success: getMetricStatus("successRate", performance?.successRate),
      latency: getMetricStatus("latency", performance?.avgLatencyMs),
      error: getMetricStatus("errorRate", performance?.errorRate),
      noDoc: getMetricStatus("noDocRate", performance?.noDocRate)
    }),
    [performance]
  );

  return { health, metricStatus };
};


// base components 
const DashCard = ({children, className}: { children: ReactNode, className?: string}) => (
    <div className={cn("rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]", className)}>
        {children}
    </div>
); 
const CardTitle = ({children}: {children: ReactNode}) => (
    <h3 className="mb-4 text-sm font-semibold text-slate-700">{children}</h3>
); 

const LoadingBlock = ({ className }: {className?: string}) => (
    <div className={cn("animate-pulse rounded-lg bg-slate-100", className)}/>
); 

// Header 
const HEALTH_CONFIG: Record<HealthStatus, {bg: string, text: string, label: string}> = {
    healthy: {bg: "bg-emerald-100", text: "text-emerald-700", label: "Healthy"}, 
    attention: {bg: "bg-amber-100", text: "text-amber-700", label: "Attention"}, 
    critical: {bg: "bg-red-100", text: "text-red-700", label: "Critical"}, 
    unknown: {bg: "bg-slate-100", text: "text-slate-500", label: "Unknown"}
}; 

const DashboardHeader = ({
    timeWindow, 
    lastUpdated, 
    loading, 
    onRefresh, 
    onTimeWindowChange}: {
        timeWindow: DashboardTimeWindow; 
        lastUpdated: number | null; 
        loading?: boolean; 
        onRefresh: () => void; 
        onTimeWindowChange: (window: DashboardTimeWindow) => void; }) => (
            <header className="mb-3 flex items-center justify-between">
                <h1 className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex rounded-lg bg-white p-1 shadow-sm">
                            {
                                WINDOW_OPTIONS.map((opt) => (
                                    <button
                                    key={opt.value}
                                    onClick={() => onTimeWindowChange(opt.value)}
                                    disabled={loading}
                                    className={cn(
                                        "rounded-md px-3 py-1.5 text-sm font-medium transition-all", 
                                        timeWindow === opt.value 
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-500 hover:text-slate-700"
                                    )}>
                                        {opt.label}
                                    </button>
                                ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>
                            <span>{formatLastUpdated(lastUpdated)}</span>
                        </div>

                        <Button 
                        variant="outline"
                        size="icon"
                        onClick={onRefresh}
                        disabled={loading}
                        className="h-9 w-9 rounded-lg border-slate-200 bg-white text-slate-500 hover:text-slate-700">
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")}/>
                        </Button>
                    </div>
                </h1>
            </header>
); 

// KPI Cards 
type KPICardProps = {
    value: string | number; 
    label: string; 
    change?: KPIChange; 
    icon: ReactNode; 
    iconBg: string; 
    iconColor: string; 
}; 

const KPICardItem = ({value, label, change, icon, iconBg, iconColor}: KPICardProps) => {
    const showChange = change && change.trend !== "flat"; 
    const isUp = change?.trend === "up"; 
    const changePositive = change?.isPositive; 

    const changeColor =  
        showChange && ((isUp && changePositive) || (!isUp && !changePositive))
        ? "text-emerald-600"
        : "text-red-500"; 
    return (
        <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
                    <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{backgroundColor: iconBg, color: iconColor}}>
                    {icon}
                </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-sm">
            {showChange ? (
              <>
                {isUp ? (
                    <TrendingUp className={cn("h-4 w-4", changeColor)} />
                ) : (
                    <TrendingDown className={cn("h-4 w-4", changeColor)} />
                )}
                <span className={cn("font-medium", changeColor)}>
              {change!.value > 0 ? "+" : ""}
                  {change!.value.toFixed(1)}%
            </span>
                <span className="text-slate-400">较上周期</span>
              </>
          ) : (
              <span className="text-slate-400">--</span>
          )}
            </div>
        </div>
    ); 
}
