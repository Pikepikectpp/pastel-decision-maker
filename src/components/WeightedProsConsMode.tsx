
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProConItem {
  id: string;
  text: string;
  weight: number;
  type: "pro" | "con";
}

interface WeightedProsConsModeProps {
  onBack: () => void;
}

const WeightedProsConsMode = ({ onBack }: WeightedProsConsModeProps) => {
  const [decisionTitle, setDecisionTitle] = useState("");
  const [items, setItems] = useState<ProConItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [newItemType, setNewItemType] = useState<"pro" | "con">("pro");
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("proscons-decision");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setDecisionTitle(data.title || "");
        setItems(data.items || []);
      } catch (error) {
        console.error("Failed to load saved decision:", error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const data = {
      title: decisionTitle,
      items: items
    };
    localStorage.setItem("proscons-decision", JSON.stringify(data));
  }, [decisionTitle, items]);

  const addItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ProConItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      weight: 3,
      type: newItemType
    };
    
    setItems([...items, newItem]);
    setNewItemText("");
    toast({
      title: "Item added",
      description: `Added to ${newItemType === "pro" ? "pros" : "cons"} list`,
    });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItemWeight = (id: string, weight: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, weight } : item
    ));
  };

  const clearAll = () => {
    setDecisionTitle("");
    setItems([]);
    localStorage.removeItem("proscons-decision");
    toast({
      title: "Cleared",
      description: "All data has been reset",
    });
  };

  const pros = items.filter(item => item.type === "pro");
  const cons = items.filter(item => item.type === "con");
  const proTotal = pros.reduce((sum, item) => sum + item.weight, 0);
  const conTotal = cons.reduce((sum, item) => sum + item.weight, 0);
  const netResult = proTotal - conTotal;

  const getResultMessage = () => {
    if (netResult > 0) return "Leaning Toward YES ✅";
    if (netResult < 0) return "Leaning Toward NO ❌";
    return "You're on the fence 🤔";
  };

  const getResultColor = () => {
    if (netResult > 0) return "text-emerald-600";
    if (netResult < 0) return "text-rose-600";
    return "text-amber-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Modes
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">Weighted Pros & Cons</h1>
        </div>

        <div className="space-y-6">
          {/* Decision Title */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0">
            <Label htmlFor="decision-title" className="text-lg font-medium text-slate-700 mb-2 block">
              What decision are you making?
            </Label>
            <Input
              id="decision-title"
              value={decisionTitle}
              onChange={(e) => setDecisionTitle(e.target.value)}
              placeholder="e.g., Should I switch jobs?"
              className="text-lg border-0 bg-slate-50 focus:bg-white transition-colors"
            />
          </Card>

          {/* Add New Item */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="new-item" className="text-sm font-medium text-slate-700 mb-2 block">
                  Add a new point
                </Label>
                <Input
                  id="new-item"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Enter a pro or con..."
                  className="border-0 bg-slate-50 focus:bg-white transition-colors"
                  onKeyPress={(e) => e.key === "Enter" && addItem()}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={newItemType === "pro" ? "default" : "outline"}
                  onClick={() => setNewItemType("pro")}
                  className={newItemType === "pro" ? "bg-emerald-500 hover:bg-emerald-600" : "hover:bg-emerald-50"}
                >
                  Pro
                </Button>
                <Button
                  variant={newItemType === "con" ? "default" : "outline"}
                  onClick={() => setNewItemType("con")}
                  className={newItemType === "con" ? "bg-rose-500 hover:bg-rose-600" : "hover:bg-rose-50"}
                >
                  Con
                </Button>
              </div>
              <Button onClick={addItem} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pros Section */}
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-0">
              <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                ✅ Pros <span className="text-sm font-normal">({proTotal})</span>
              </h2>
              <div className="space-y-4">
                {pros.map((item) => (
                  <div key={item.id} className="bg-white/60 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-slate-700 flex-1">{item.text}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Weight: {item.weight}</Label>
                      <Slider
                        value={[item.weight]}
                        onValueChange={(value) => updateItemWeight(item.id, value[0])}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
                {pros.length === 0 && (
                  <p className="text-emerald-600/60 text-center py-8">No pros added yet</p>
                )}
              </div>
            </Card>

            {/* Cons Section */}
            <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-0">
              <h2 className="text-xl font-semibold text-rose-800 mb-4 flex items-center gap-2">
                ❌ Cons <span className="text-sm font-normal">({conTotal})</span>
              </h2>
              <div className="space-y-4">
                {cons.map((item) => (
                  <div key={item.id} className="bg-white/60 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-slate-700 flex-1">{item.text}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Weight: {item.weight}</Label>
                      <Slider
                        value={[item.weight]}
                        onValueChange={(value) => updateItemWeight(item.id, value[0])}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
                {cons.length === 0 && (
                  <p className="text-rose-600/60 text-center py-8">No cons added yet</p>
                )}
              </div>
            </Card>
          </div>

          {/* Results */}
          {items.length > 0 && (
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-0">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">Results</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">✅ {proTotal}</div>
                  <div className="text-slate-600">Total Pro Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-600 mb-2">❌ {conTotal}</div>
                  <div className="text-slate-600">Total Con Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${getResultColor()}`}>
                    {netResult > 0 ? `+${netResult}` : netResult}
                  </div>
                  <div className="text-slate-600">Net Result</div>
                </div>
              </div>

              <div className="text-center">
                <div className={`text-xl font-semibold ${getResultColor()}`}>
                  {getResultMessage()}
                </div>
              </div>

              {/* Visual Balance */}
              <div className="mt-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-sm text-slate-600">Cons</span>
                  <div className="flex-1 h-6 bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ width: `${proTotal === 0 && conTotal === 0 ? 0 : (proTotal / (proTotal + conTotal)) * 100}%` }}
                    />
                    <div 
                      className="bg-rose-500 transition-all duration-500"
                      style={{ width: `${proTotal === 0 && conTotal === 0 ? 0 : (conTotal / (proTotal + conTotal)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600">Pros</span>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={clearAll}
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <RotateCcw className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightedProsConsMode;
