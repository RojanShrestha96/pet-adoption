import { useState } from "react";
import axios from "axios";
import { Search, MapPin, CheckCircle, AlertTriangle, XCircle, Play, Database } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";

interface TestResult {
  shelterName: string;
  coordinates: [number, number];
  mongoDistanceKm: number;
  haversineDistanceKm: number;
  differenceKm: number;
  status: "ACCURATE" | "ACCEPTABLE" | "INVESTIGATE";
}

interface TestResponse {
  input: {
    location: string;
    coordinates: { lat: number; lng: number };
  };
  results: TestResult[];
  meta: {
    radiusUsed: number;
    totalFound: number;
    averageError: string;
  };
  compareWith?: {
    location: string;
    coordinates: { lat: number; lng: number };
    distanceBetweenInputs: string;
  };
}

export function GeoTestPage() {
  const [locationA, setLocationA] = useState("Kathmandu");
  const [locationB, setLocationB] = useState("Lalitpur");
  const [radius, setRadius] = useState(25);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [testData, setTestData] = useState<TestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async (seed = false) => {
    setLoading(true);
    setError(null);
    if (seed) setSeeding(true);

    try {
      const response = await axios.get<TestResponse>(`http://localhost:5000/api/test/geolocation`, {
        params: {
          location: locationA,
          compareWith: locationB,
          radius,
          seed,
        },
      });
      setTestData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to run geolocation test.");
    } finally {
      setLoading(false);
      setSeeding(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCURATE": return <CheckCircle className="text-green-500 w-5 h-5" />;
      case "ACCEPTABLE": return <AlertTriangle className="text-yellow-500 w-5 h-5" />;
      case "INVESTIGATE": return <XCircle className="text-red-500 w-5 h-5" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCURATE": return "bg-green-50 text-green-700 border-green-200";
      case "ACCEPTABLE": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "INVESTIGATE": return "bg-red-50 text-red-700 border-red-200";
      default: return "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-4" style={{ color: "var(--color-text)" }}>
          🌍 Geolocation Testing System
        </h1>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">
          Verify MongoDB's <code>$geoNear</code> accuracy against manual Haversine math.
          Benchmark coordinates and validate distance-based filtering.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-2 border-indigo-100 shadow-indigo-50 shadow-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" /> Test Parameters
            </h2>
            
            <div className="space-y-4">
              <Input
                label="Location A (Center)"
                value={locationA}
                onChange={(e) => setLocationA(e.target.value)}
                placeholder="e.g. Kathmandu"
              />
              <Input
                label="Location B (Compare)"
                value={locationB}
                onChange={(e) => setLocationB(e.target.value)}
                placeholder="e.g. Lalitpur (Optional)"
              />
              <div>
                <label className="block text-sm font-medium mb-1 opacity-70">Testing Radius (km)</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>1km</span>
                  <span className="font-bold text-indigo-600">{radius}km</span>
                  <span>100km</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  fullWidth 
                  onClick={() => runTest(false)} 
                  disabled={loading}
                  variant="primary"
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
                >
                  {loading && !seeding ? "Calculating..." : (
                    <span className="flex items-center gap-2">
                      <Play className="w-4 h-4" /> Run Accuracy Test
                    </span>
                  )}
                </Button>
                
                <Button 
                  fullWidth 
                  onClick={() => runTest(true)} 
                  disabled={loading}
                  variant="outline"
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  {seeding ? "Seeding..." : (
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4" /> Seed & Test Accuracy
                    </span>
                  )}
                </Button>
                <p className="text-[10px] text-center text-gray-400 italic">
                  *Seed creates controlled test shelters in Kathmandu, Lalitpur, and Bhaktapur.
                </p>
              </div>
            </div>
          </Card>

          {testData && (
            <Card className="p-6 bg-indigo-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <MapPin className="w-24 h-24" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-300 mb-4">Input Resolution</h3>
              <div className="space-y-3 relative z-10">
                <div>
                  <p className="text-xs text-indigo-300">Point A ({testData.input.location})</p>
                  <p className="font-mono text-sm">{testData.input.coordinates.lat.toFixed(6)}, {testData.input.coordinates.lng.toFixed(6)}</p>
                </div>
                {testData.compareWith && (
                  <div>
                    <p className="text-xs text-indigo-300">Point B ({testData.compareWith.location})</p>
                    <p className="font-mono text-sm">{testData.compareWith.coordinates.lat.toFixed(6)}, {testData.compareWith.coordinates.lng.toFixed(6)}</p>
                    <p className="mt-2 text-xs font-bold bg-white/20 px-2 py-1 rounded inline-block">
                      Interval Distance: {testData.compareWith.distanceBetweenInputs} km
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 flex items-center gap-2">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!testData && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              <MapPin className="w-12 h-12 mb-4 opacity-20" />
              <p>Configure parameters and run test to see accuracy results.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-indigo-600 rounded-2xl bg-indigo-50/50 animate-pulse">
              <Database className="w-12 h-12 mb-4 animate-bounce" />
              <p className="font-medium">Querying MongoDB & Indexing Cluster...</p>
            </div>
          )}

          {testData && !loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Total Results</p>
                  <p className="text-2xl font-black text-indigo-600">{testData.meta.totalFound}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Radius</p>
                  <p className="text-2xl font-black text-indigo-600">{testData.meta.radiusUsed}km</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Mean Error</p>
                  <p className="text-2xl font-black text-indigo-600">{testData.meta.averageError} km</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase">
                      <th className="px-6 py-4">Shelter</th>
                      <th className="px-6 py-4">Mongo $geoNear</th>
                      <th className="px-6 py-4">Haversine Math</th>
                      <th className="px-6 py-4 text-center">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {testData.results.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                          No shelters found within {radius}km of center.
                        </td>
                      </tr>
                    ) : (
                      testData.results.map((result, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{result.shelterName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {result.coordinates[1].toFixed(4)}, {result.coordinates[0].toFixed(4)}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                            {result.mongoDistanceKm.toFixed(3)} km
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-600">
                            {result.haversineDistanceKm.toFixed(3)} km
                          </td>
                          <td className="px-6 py-4">
                            <div className={`mx-auto flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border uppercase ${getStatusColor(result.status)}`}>
                              {getStatusIcon(result.status)}
                              {result.status}
                            </div>
                            <div className="text-[9px] text-center mt-1 text-gray-400">
                              Δ {result.differenceKm.toFixed(4)} km
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
